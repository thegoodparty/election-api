export const getStartOfTwoYearsFromNow = () => {
  const startOfTwoYearsFromNow = new Date();
  startOfTwoYearsFromNow.setFullYear(startOfTwoYearsFromNow.getFullYear() + 2);
  startOfTwoYearsFromNow.setMonth(0); // Jan
  startOfTwoYearsFromNow.setDate(1); // First day
  return startOfTwoYearsFromNow;
}