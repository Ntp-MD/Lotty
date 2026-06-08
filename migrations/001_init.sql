-- ============================================================
-- Lotty — 001_init.sql
-- ============================================================

-- draws: ผลสลากแต่ละงวด
CREATE TABLE IF NOT EXISTS draws (
  id          BIGSERIAL PRIMARY KEY,
  draw_date   DATE        NOT NULL UNIQUE,
  first       TEXT        NOT NULL,
  last2       TEXT        NOT NULL,
  last3f      TEXT        NOT NULL,
  last3b      TEXT        NOT NULL,
  second      TEXT[]      NOT NULL DEFAULT '{}',
  third       TEXT[]      NOT NULL DEFAULT '{}',
  fourth      TEXT[]      NOT NULL DEFAULT '{}',
  fifth       TEXT[]      NOT NULL DEFAULT '{}',
  near1       TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS draws_draw_date_idx ON draws (draw_date DESC);

-- stats_cache: เก็บผล aggregation ที่คำนวณแล้ว
CREATE TABLE IF NOT EXISTS stats_cache (
  id          BIGSERIAL PRIMARY KEY,
  stat_type   TEXT        NOT NULL,
  scope       TEXT        NOT NULL,
  data_json   JSONB       NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stat_type, scope)
);

CREATE INDEX IF NOT EXISTS stats_cache_type_scope_idx ON stats_cache (stat_type, scope);

-- ============================================================
-- RPC: get_2digit_stats
-- Returns frequency ranking for 2-digit numbers
-- ============================================================
CREATE OR REPLACE FUNCTION get_2digit_stats(
  p_col   TEXT,
  p_scope TEXT,
  p_month INT  DEFAULT NULL,
  p_day   TEXT DEFAULT NULL
)
RETURNS TABLE (
  number    TEXT,
  count     BIGINT,
  last_draw DATE,
  gap       INT,
  pct       NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_from DATE;
  v_max_date DATE;
BEGIN
  -- Determine date range from scope
  IF p_scope = '1y'  THEN v_from := CURRENT_DATE - INTERVAL '1 year';
  ELSIF p_scope = '3y'  THEN v_from := CURRENT_DATE - INTERVAL '3 years';
  ELSIF p_scope = '5y'  THEN v_from := CURRENT_DATE - INTERVAL '5 years';
  ELSIF p_scope = '10y' THEN v_from := CURRENT_DATE - INTERVAL '10 years';
  ELSE v_from := '1900-01-01';
  END IF;

  SELECT MAX(draw_date) INTO v_max_date FROM draws;

  RETURN QUERY EXECUTE format(
    $q$
    WITH base AS (
      SELECT %I AS num, draw_date
      FROM draws
      WHERE draw_date >= $1
        AND ($2 IS NULL OR EXTRACT(MONTH FROM draw_date) = $2)
        AND ($3 IS NULL OR EXTRACT(DAY FROM draw_date) = $3::INT)
    ),
    counts AS (
      SELECT num AS number, COUNT(*) AS count, MAX(draw_date) AS last_draw
      FROM base
      GROUP BY num
    ),
    total AS (SELECT SUM(count) AS t FROM counts),
    all_nums AS (
      SELECT lpad(g::TEXT, %s, '0') AS number FROM generate_series(0, %s) g
    )
    SELECT
      a.number,
      COALESCE(c.count, 0)::BIGINT,
      c.last_draw,
      CASE WHEN c.last_draw IS NULL THEN 999
           ELSE (SELECT COUNT(*) FROM draws WHERE draw_date > c.last_draw AND draw_date >= $1)
      END::INT AS gap,
      ROUND(COALESCE(c.count, 0)::NUMERIC / NULLIF((SELECT t FROM total), 0) * 100, 2) AS pct
    FROM all_nums a
    LEFT JOIN counts c ON a.number = c.number
    ORDER BY COALESCE(c.count, 0) DESC
    $q$,
    p_col,
    CASE WHEN p_col = 'first' THEN '6' ELSE '2' END,
    CASE WHEN p_col = 'first' THEN '999999' ELSE '99' END
  ) USING v_from, p_month, p_day;
END;
$$;

-- ============================================================
-- RPC: get_3digit_stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_3digit_stats(
  p_col   TEXT,
  p_scope TEXT,
  p_month INT DEFAULT NULL
)
RETURNS TABLE (
  number    TEXT,
  count     BIGINT,
  last_draw DATE,
  gap       INT,
  pct       NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_from DATE;
BEGIN
  IF p_scope = '1y'  THEN v_from := CURRENT_DATE - INTERVAL '1 year';
  ELSIF p_scope = '3y'  THEN v_from := CURRENT_DATE - INTERVAL '3 years';
  ELSIF p_scope = '5y'  THEN v_from := CURRENT_DATE - INTERVAL '5 years';
  ELSIF p_scope = '10y' THEN v_from := CURRENT_DATE - INTERVAL '10 years';
  ELSE v_from := '1900-01-01';
  END IF;

  RETURN QUERY EXECUTE format(
    $q$
    WITH base AS (
      SELECT %I AS num, draw_date
      FROM draws
      WHERE draw_date >= $1
        AND ($2 IS NULL OR EXTRACT(MONTH FROM draw_date) = $2)
    ),
    counts AS (
      SELECT num AS number, COUNT(*) AS count, MAX(draw_date) AS last_draw
      FROM base
      GROUP BY num
    ),
    total AS (SELECT SUM(count) AS t FROM counts),
    all_nums AS (
      SELECT lpad(g::TEXT, 3, '0') AS number FROM generate_series(0, 999) g
    )
    SELECT
      a.number,
      COALESCE(c.count, 0)::BIGINT,
      c.last_draw,
      CASE WHEN c.last_draw IS NULL THEN 999
           ELSE (SELECT COUNT(*) FROM draws WHERE draw_date > c.last_draw AND draw_date >= $1)
      END::INT AS gap,
      ROUND(COALESCE(c.count, 0)::NUMERIC / NULLIF((SELECT t FROM total), 0) * 100, 2) AS pct
    FROM all_nums a
    LEFT JOIN counts c ON a.number = c.number
    ORDER BY COALESCE(c.count, 0) DESC
    $q$,
    p_col
  ) USING v_from, p_month;
END;
$$;

-- ============================================================
-- RPC: get_digit_stats
-- Returns per-position digit frequency for the 'first' prize
-- ============================================================
CREATE OR REPLACE FUNCTION get_digit_stats(p_scope TEXT)
RETURNS TABLE (
  "position" INT,
  freq       JSONB,
  hot_digit  TEXT,
  cold_digit TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_from DATE;
  pos    INT;
  freq_obj JSONB;
  hot    TEXT;
  cold   TEXT;
BEGIN
  IF p_scope = '1y'  THEN v_from := CURRENT_DATE - INTERVAL '1 year';
  ELSIF p_scope = '3y'  THEN v_from := CURRENT_DATE - INTERVAL '3 years';
  ELSIF p_scope = '5y'  THEN v_from := CURRENT_DATE - INTERVAL '5 years';
  ELSIF p_scope = '10y' THEN v_from := CURRENT_DATE - INTERVAL '10 years';
  ELSE v_from := '1900-01-01';
  END IF;

  FOR pos IN 1..6 LOOP
    SELECT jsonb_object_agg(digit, cnt)
    INTO freq_obj
    FROM (
      SELECT SUBSTRING(first, pos, 1) AS digit, COUNT(*) AS cnt
      FROM draws
      WHERE draw_date >= v_from AND LENGTH(first) >= pos
      GROUP BY digit
    ) t;

    SELECT key INTO hot FROM jsonb_each_text(freq_obj) ORDER BY value::INT DESC LIMIT 1;
    SELECT key INTO cold FROM jsonb_each_text(freq_obj) ORDER BY value::INT ASC  LIMIT 1;

    position   := pos;
    freq       := freq_obj;
    hot_digit  := hot;
    cold_digit := cold;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- ============================================================
-- RPC: get_lookup_stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_lookup_stats(
  p_number TEXT,
  p_col    TEXT,
  p_scope  TEXT
)
RETURNS TABLE (
  count     BIGINT,
  last_draw DATE,
  gap       INT,
  history   JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_from DATE;
BEGIN
  IF p_scope = '1y'  THEN v_from := CURRENT_DATE - INTERVAL '1 year';
  ELSIF p_scope = '3y'  THEN v_from := CURRENT_DATE - INTERVAL '3 years';
  ELSIF p_scope = '5y'  THEN v_from := CURRENT_DATE - INTERVAL '5 years';
  ELSIF p_scope = '10y' THEN v_from := CURRENT_DATE - INTERVAL '10 years';
  ELSE v_from := '1900-01-01';
  END IF;

  RETURN QUERY EXECUTE format(
    $q$
    WITH matches AS (
      SELECT draw_date FROM draws
      WHERE %I = $1 AND draw_date >= $2
      ORDER BY draw_date DESC
    )
    SELECT
      COUNT(*)::BIGINT AS count,
      MAX(draw_date)   AS last_draw,
      CASE WHEN MAX(draw_date) IS NULL THEN 999
           ELSE (SELECT COUNT(*) FROM draws WHERE draw_date > MAX(draw_date) AND draw_date >= $2)
      END::INT AS gap,
      jsonb_agg(jsonb_build_object('draw_date', draw_date) ORDER BY draw_date DESC) AS history
    FROM matches
    $q$,
    p_col
  ) USING p_number, v_from;
END;
$$;

-- ============================================================
-- Row-level security: draws is read-only for anon
-- ============================================================
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "draws_select_anon" ON draws FOR SELECT USING (true);

ALTER TABLE stats_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_cache_select_anon" ON stats_cache FOR SELECT USING (true);
