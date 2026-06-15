import { ref, computed } from "vue";

const locale = ref<"en" | "th">("th");

const translations: Record<string, { en: string; th: string }> = {
  // Navigation
  "nav.recommend": { en: "Recommend", th: "แนะนำ" },
  "nav.2digit": { en: "2 Digit", th: "2 ตัว" },
  "nav.3digit": { en: "3 Digit", th: "3 ตัว" },
  "nav.statBar": { en: "Stat Graph", th: "กราฟสถิติ" },
  "nav.archive": { en: "Archive", th: "ย้อนหลัง" },

  // Page Titles & Subs
  "title.recommend": { en: "Recommended Numbers", th: "เลขแนะนำ" },
  "sub.recommend": { en: "Longest gap + Quick Pick", th: "เว้นว่างนานที่สุด + สุ่มเลข" },
  "title.2digit": { en: "2 Digit", th: "2 ตัว" },
  "sub.2digit": { en: "Statistics for last 2 digits", th: "สถิติ 2 ตัวล่าง" },
  "title.3digit": { en: "3 Digit", th: "3 ตัว" },
  "sub.3digit": { en: "Statistics for 3 digits (top/front/bottom)", th: "สถิติ 3 ตัว (บน/หน้า/ล่าง)" },
  "title.statBar": { en: "Stat Bar", th: "กราฟแท่งสถิติ" },
  "sub.statBar": { en: "Digit breakdown graph 2/3/6 digits", th: "กราฟแยกตัวเลข 2/3/6 หลัก" },
  "title.archive": { en: "Archive", th: "ย้อนหลัง" },
  "sub.archive": { en: "Historical lottery results", th: "ผลการออกรางวัลย้อนหลัง" },

  // General / Results
  "results.latest": { en: "Latest Draw Results", th: "ผลการออกรางวัลล่าสุด" },
  "results.firstPrize": { en: "1st Prize", th: "รางวัลที่ 1" },
  "results.last3f": { en: "3 Digit Front", th: "3 ตัวหน้า" },
  "results.last3b": { en: "3 Digit Bottom", th: "3 ตัวล่าง" },
  "results.last2": { en: "2 Digit Bottom", th: "2 ตัวล่าง" },
  "results.historical": { en: "Historical Results", th: "ผลการออกรางวัลย้อนหลัง" },

  // Hero
  "hero.nextDraw": { en: "Next draw in", th: "งวดถัดไปอีก" },
  "hero.days": { en: "days", th: "วัน" },
  "hero.today": { en: "Draw day!", th: "วันนี้ออกรางวัล!" },

  // Quick Pick
  "quickpick.title": { en: "Quick Pick", th: "สุ่มเลข" },
  "quickpick.desc": { en: "Random by statistics — numbers with longer gaps get more weight", th: "สุ่มตามสถิติ — เลขที่ไม่ออกนานจะมีน้ำหนักมากขึ้น" },
  "quickpick.calculating": { en: "Calculating...", th: "กำลังคำนวณ..." },
  "quickpick.random": { en: "Random by Statistics", th: "สุ่มตามสถิติ" },
  "quickpick.reset": { en: "Reset", th: "รีเซ็ต" },
  "quickpick.copy": { en: "Copy Numbers", th: "คัดลอกเลข" },

  // Statistics Lookup
  "lookup.title": { en: "Number Statistics Lookup", th: "ค้นหาสถิติเลข" },
  "lookup.placeholder": { en: "Enter 2–3 digit number", th: "ใส่เลข 2-3 หลัก" },
  "lookup.aria": { en: "Search number statistics", th: "ค้นหาสถิติเลข" },
  "lookup.searching": { en: "Searching...", th: "กำลังค้นหา..." },
  "lookup.search": { en: "Search", th: "ค้นหา" },
  "lookup.totalAppeared": { en: "Total Appeared", th: "ออกทั้งหมด" },
  "lookup.times": { en: "times", th: "ครั้ง" },
  "lookup.rank": { en: "Rank", th: "อันดับ" },
  "lookup.latest": { en: "Latest", th: "ล่าสุด" },
  "lookup.gap": { en: "Gap", th: "เว้นว่าง" },
  "lookup.never": { en: "Never", th: "ไม่เคยออก" },
  "lookup.draws": { en: "draws", th: "งวด" },

  // Combo Finder
  "combo.title": { en: "Combo Finder", th: "ค้นหาคอมโบ" },
  "combo.hintOpen": { en: "Click to open", th: "คลิกเพื่อเปิด" },
  "combo.hint": { en: "Click lock on desired positions and check pattern frequency", th: "คลิกล็อกตำแหน่งที่ต้องการและตรวจสอบความถี่ของรูปแบบ" },
  "combo.position": { en: "Position", th: "ตำแหน่ง" },
  "combo.lockAria": { en: "Lock position {pos} to number {digit}", th: "ล็อกตำแหน่ง {pos} เป็นเลข {digit}" },
  "combo.frequency": { en: "Pattern frequency:", th: "ความถี่ของรูปแบบ:" },

  // Digit Breakdown Chart / Headings
  "breakdown.title6d": { en: "1st Prize — 6 Digit Breakdown", th: "รางวัลที่ 1 — แยก 6 หลัก" },
  "breakdown.title2d": { en: "2 Digit — Digit Breakdown", th: "2 ตัว — แยกตัวเลข" },
  "breakdown.title3d": { en: "3 Digit — Digit Breakdown", th: "3 ตัว — แยกตัวเลข" },
  "breakdown.title10": { en: "Top 10 Frequent", th: "10 อันดับที่ออกบ่อย" },
  "breakdown.digitBreakdown": { en: "Digit Breakdown", th: "แยกตัวเลข" },
  "breakdown.heatmap": { en: "Frequency Heatmap", th: "แผนที่ความถี่" },
  "breakdown.table": { en: "Frequency Table", th: "ตารางความถี่" },

  // Archive Filter/Pagination
  "archive.allYears": { en: "All Years", th: "ทุกปี" },
  "archive.allMonths": { en: "All Months", th: "ทุกเดือน" },
  "archive.monthName": { en: "Month {m}", th: "เดือน {m}" },
  "archive.prev": { en: "← Previous", th: "← ก่อนหน้า" },
  "archive.page": { en: "Page {p}", th: "หน้า {p}" },
  "archive.next": { en: "Next →", th: "ถัดไป →" },
  "archive.detail.first": { en: "1st Prize", th: "รางวัลที่ 1" },
  "archive.detail.last2": { en: "2 Digit Last", th: "2 ตัวล่าง" },
  "archive.detail.last3f": { en: "3 Digit Front", th: "3 ตัวหน้า" },
  "archive.detail.last3b": { en: "3 Digit Last", th: "3 ตัวล่าง" },

  // 3Digit Search
  "search.placeholder": { en: "Search number e.g. 123", th: "ค้นหาเลข เช่น 123" },
  "search.aria": { en: "Search 3 digit number", th: "ค้นหาเลข 3 หลัก" },
  "table.number": { en: "Number", th: "เลข" },
  "table.count": { en: "Count", th: "จำนวน" },
  "table.lastDraw": { en: "Last Draw", th: "งวดล่าสุด" },
  "table.gap": { en: "Gap", th: "เว้นว่าง" },
  "table.loadMore": { en: "Load More (Showing {current} / {total})", th: "โหลดเพิ่ม (แสดง {current} / {total})" },

  // FilterBar
  "filter.timePeriod": { en: "Time Period", th: "ช่วงเวลา" },
  "filter.1y": { en: "1 Year", th: "1 ปี" },
  "filter.3y": { en: "3 Years", th: "3 ปี" },
  "filter.5y": { en: "5 Years", th: "5 ปี" },
  "filter.10y": { en: "10 Years", th: "10 ปี" },
  "filter.all": { en: "All", th: "ทั้งหมด" },
  "filter.advancedOpen": { en: "+ Advanced Options", th: "+ ตัวเลือกขั้นสูง" },
  "filter.advancedClose": { en: "- Advanced Options", th: "- ตัวเลือกขั้นสูง" },
  "filter.month": { en: "Month", th: "เดือน" },
  "filter.monthDesc": { en: "Filter by draw month", th: "กรองตามเดือนออกรางวัล" },
  "filter.allYear": { en: "All Year", th: "ทั้งปี" },
  "filter.drawDate": { en: "Draw Date", th: "วันออกรางวัล" },
  "filter.drawDateDesc": { en: "Filter by draw date (1 or 16)", th: "กรองตามวันออกรางวัล (1 หรือ 16)" },
  "filter.allDraws": { en: "All Draws", th: "ทุกงวด" },
  "filter.1st": { en: "1st of Month", th: "วันที่ 1 ของเดือน" },
  "filter.16th": { en: "16th of Month", th: "วันที่ 16 ของเดือน" },

  // LotteryTicketCard
  "ticket.title": { en: "Recommended Numbers for {date}", th: "เลขแนะนำสำหรับ {date}" },
  "ticket.scope": { en: "Based on {scope} statistics", th: "อิงจากสถิติ {scope}" },
  "ticket.gap": { en: "Gap {g}", th: "เว้นว่าง {g}" },
  "ticket.never": { en: "Never", th: "ไม่เคยออก" },
  "ticket.draws": { en: "{g} draws", th: "{g} งวด" },
  "ticket.disclaimerToggle": { en: "For reference only ℹ", th: "เพื่ออ้างอิงเท่านั้น ℹ" },
  "ticket.disclaimer": {
    en: "All data is based on historical lottery statistics. This is not a prediction or guarantee of winning results. Government lottery is a game of chance. Please use your own judgment when making decisions.",
    th: "ข้อมูลทั้งหมดอิงจากสถิติสลากกินแบ่งรัฐบาลย้อนหลัง ไม่ใช่การพยากรณ์หรือรับประกันผลการออกรางวัล สลากกินแบ่งรัฐบาลเป็นเกมแห่งโอกาส โปรดใช้วิจารณญาณของคุณเองในการตัดสินใจ"
  },

  // EmptyState
  "empty.no_search_result": { en: "No search results found", th: "ไม่พบผลการค้นหา" },
  "empty.no_data_in_range": { en: "No data found in selected {scope} range", th: "ไม่พบข้อมูลในช่วง {scope} ที่เลือก" },
  "empty.no_data": { en: "No data found", th: "ไม่พบข้อมูล" },

  // ErrorCard
  "error.retry": { en: "Retry", th: "ลองใหม่" },
  "error.load_failed": { en: "Failed to load data", th: "โหลดข้อมูลไม่สำเร็จ" },

  // Error Page
  "error.notFound": { en: "Page not found", th: "ไม่พบหน้าที่ต้องการ" },
  "error.backHome": { en: "Back to Home", th: "กลับหน้าหลัก" }
};

export function useLanguage() {
  const t = (key: string, params: Record<string, string | number> = {}): string => {
    const translation = translations[key];
    if (!translation) return key;
    let text = translation[locale.value];
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{${k}}`, "g"), String(v));
    });
    return text;
  };

  const toggleLocale = () => {
    locale.value = locale.value === "en" ? "th" : "en";
    if (process.client) {
      localStorage.setItem("locale", locale.value);
    }
  };

  const initLocale = () => {
    if (process.client) {
      const saved = localStorage.getItem("locale") as "en" | "th" | null;
      if (saved) {
        locale.value = saved;
      } else {
        const browserLang = navigator.language.toLowerCase();
        locale.value = browserLang.startsWith("th") ? "th" : "en";
      }
    }
  };

  return {
    locale,
    t,
    toggleLocale,
    initLocale
  };
}
