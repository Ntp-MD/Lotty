export const useDarkMode = () => {
  const isDark = useState("darkMode", () => false);

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", isDark.value);
      localStorage.setItem("theme", isDark.value ? "dark" : "light");
    }
  };

  const initDarkMode = () => {
    if (import.meta.client) {
      isDark.value = localStorage.getItem("theme") === "dark";
      document.documentElement.classList.toggle("dark", isDark.value);
    }
  };

  return { isDark, toggleDarkMode, initDarkMode };
};
