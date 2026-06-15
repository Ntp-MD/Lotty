export const useDarkMode = () => {
  const isDark = ref(false);

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const initDarkMode = () => {
    const savedTheme = localStorage.getItem("theme");
    isDark.value = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark.value);
  };

  return { isDark, toggleDarkMode, initDarkMode };
};
