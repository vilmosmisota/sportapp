/**
 * Calculates the attendance rate based on the number of on-time, late, and absent attendees.
 * Formula: (onTime + late) / (onTime + late + absent) * 100
 *
 * @param onTime Number of on-time attendees
 * @param late Number of late attendees
 * @param absent Number of absent attendees
 * @returns Attendance rate as a percentage (0-100)
 */
export function calculateAttendanceRate(
  onTime: number,
  late: number,
  absent: number
): number {
  // Handle invalid inputs
  const sanitizedOnTime = Math.max(0, onTime);
  const sanitizedLate = Math.max(0, late);
  const sanitizedAbsent = Math.max(0, absent);

  const total = sanitizedOnTime + sanitizedLate + sanitizedAbsent;
  if (total === 0) return 0;

  return Math.round(((sanitizedOnTime + sanitizedLate) / total) * 100);
}

/**
 * Calculates the accuracy rate based on the number of on-time and late attendees.
 * Formula: onTime / (onTime + late) * 100
 * Measures the percentage of attending players who arrived on time.
 *
 * @param onTime Number of on-time attendees
 * @param late Number of late attendees
 * @returns Accuracy rate as a percentage (0-100)
 */
export function calculateAccuracyRate(onTime: number, late: number): number {
  // Handle invalid inputs
  const sanitizedOnTime = Math.max(0, onTime);
  const sanitizedLate = Math.max(0, late);

  const attending = sanitizedOnTime + sanitizedLate;
  if (attending === 0) return 0;

  return Math.round((sanitizedOnTime / attending) * 100);
}
