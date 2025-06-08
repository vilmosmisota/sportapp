export const formatAgeRange = (ageRange: string) => {
  const rangeParts = ageRange.split("-");
  if (rangeParts.length === 2) {
    const min = parseInt(rangeParts[0]);
    const max = parseInt(rangeParts[1]);
    if (!isNaN(min) && !isNaN(max)) {
      if (max <= 18) {
        return `U${max}`;
      } else if (min >= 65) {
        return "Senior";
      } else {
        return "Adult";
      }
    }
  }

  return ageRange;
};
