export const calculateDuration = (startDate: Date, endDate: Date): string => {
  const diff = Math.abs(endDate.getTime() - startDate.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "1 day";
  } else {
    return `${days + 1} days`;
  }
};

export const createNextDayDate = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    date.getHours(),
    date.getMinutes()
  );
};
