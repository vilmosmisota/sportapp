import {
  calculateAttendanceRate,
  calculateAccuracyRate,
} from "./Attendance.utils";

describe("Attendance Calculation Utilities", () => {
  describe("calculateAttendanceRate", () => {
    it("should calculate correct attendance rate when all values are present", () => {
      expect(calculateAttendanceRate(3, 1, 1)).toBe(80); // (3+1)/(3+1+1) = 80%
      expect(calculateAttendanceRate(5, 0, 5)).toBe(50); // (5+0)/(5+0+5) = 50%
      expect(calculateAttendanceRate(0, 3, 7)).toBe(30); // (0+3)/(0+3+7) = 30%
    });

    it("should handle zero total case", () => {
      expect(calculateAttendanceRate(0, 0, 0)).toBe(0);
    });

    it("should handle perfect attendance case", () => {
      expect(calculateAttendanceRate(10, 0, 0)).toBe(100);
      expect(calculateAttendanceRate(5, 5, 0)).toBe(100);
    });

    it("should handle no attendance case", () => {
      expect(calculateAttendanceRate(0, 0, 10)).toBe(0);
    });

    it("should match the real-world example", () => {
      // From the sample data: onTime:3, late:0, absent:2
      expect(calculateAttendanceRate(3, 0, 2)).toBe(60);
    });
  });

  describe("calculateAccuracyRate", () => {
    it("should calculate correct accuracy rate when on-time and late values are present", () => {
      expect(calculateAccuracyRate(3, 1)).toBe(75); // 3/(3+1) = 75%
      expect(calculateAccuracyRate(5, 5)).toBe(50); // 5/(5+5) = 50%
      expect(calculateAccuracyRate(10, 0)).toBe(100); // 10/(10+0) = 100%
    });

    it("should handle zero attendance case", () => {
      expect(calculateAccuracyRate(0, 0)).toBe(0);
    });

    it("should handle only late attendees case", () => {
      expect(calculateAccuracyRate(0, 5)).toBe(0);
    });

    it("should handle only on-time attendees case", () => {
      expect(calculateAccuracyRate(7, 0)).toBe(100);
    });

    it("should match the real-world example", () => {
      // From the sample data: onTime:3, late:0
      expect(calculateAccuracyRate(3, 0)).toBe(100);
    });

    it("should handle edge cases correctly", () => {
      expect(calculateAccuracyRate(-1, 5)).toBe(0); // Invalid input should be safe
      expect(calculateAccuracyRate(5, -1)).toBe(100); // When late is negative, it's treated as 0, so 5/(5+0) = 100%
      expect(calculateAccuracyRate(0.5, 0.5)).toBe(50); // Decimal inputs should work
    });
  });
});
