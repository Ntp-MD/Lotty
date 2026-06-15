export const useLuckyNumbers = () => {
  const luckyNumbers = ref<string[]>([]);

  const generateLuckyNumbers = () => {
    luckyNumbers.value = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 100).toString().padStart(2, "0")
    );
  };

  return { luckyNumbers, generateLuckyNumbers };
};
