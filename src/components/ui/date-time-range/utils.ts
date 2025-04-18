export const calculateDuration = (startDate: Date, endDate: Date): string => {
  const diff = Math.abs(endDate.getTime() - startDate.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let result = "";

  if (days > 0) {
    result += `${days}d `;
  }

  if (hours > 0 || days > 0) {
    result += `${hours}h`;
    if (minutes > 0) {
      result += ` ${minutes}m`;
    }
  } else {
    result = `${minutes}m`;
  }

  return result;
};

export const createDateWithTime = (date: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const newDate = new Date(date);
  if (!isNaN(hours) && !isNaN(minutes)) {
    newDate.setHours(hours, minutes);
  }
  return newDate;
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
