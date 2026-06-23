// Cookie-backed so the same value is available during SSR and on the client,
// eliminating the FOUC + hydration mismatch the previous localStorage-only
// implementation produced. We keep `localStorage` in sync for callers that
// expect it.
const COOKIE_NAME = "theme";

export const useDarkMode = () => {
  const themeCookie = useCookie<"dark" | "light">(COOKIE_NAME, {
    default: () => "light",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  const isDark = useState("darkMode", () => themeCookie.value === "dark");

  const applyClass = () => {
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", isDark.value);
    }
  };

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    themeCookie.value = isDark.value ? "dark" : "light";
    if (import.meta.client) {
      try {
        localStorage.setItem("theme", themeCookie.value);
      } catch {
        // Storage may be unavailable (private mode, blocked); cookie is the
        // source of truth so this is non-fatal.
      }
    }
    applyClass();
  };

  const initDarkMode = () => {
    if (import.meta.client) {
      // Cookie wins, but reconcile with any pre-existing localStorage choice
      // so users who set the theme before this cookie migration keep theirs.
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("theme");
      } catch {
        stored = null;
      }
      if (stored === "dark" || stored === "light") {
        const next = stored === "dark";
        if (next !== isDark.value) {
          isDark.value = next;
          themeCookie.value = stored;
        }
      }
      applyClass();
    }
  };

  return { isDark, toggleDarkMode, initDarkMode };
};
