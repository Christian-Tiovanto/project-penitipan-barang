export function isPastDays(
  startDate: Date,
  days: number,
  endDate: Date,
): boolean {
  const now = new Date(endDate);
  const targetDate = new Date(startDate);
  targetDate.setHours(0, 0, 0, 0);

  targetDate.setDate(targetDate.getDate() + days);

  return now.getTime() > targetDate.getTime();
}

export function pastDaysCount(startDate: Date, endDate: Date): number {
  const now = new Date(endDate);
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

export function isOutsideBusinessHours(date: Date): boolean {
  const hours = date.getHours();
  const startHour = 8;
  const endHour = 17;
  return hours < startHour || hours >= endHour;
}

export function convertToWIB(utcDate: Date): Date {
  const wibOffset = 7;
  return new Date(utcDate.getTime() + wibOffset * 60 * 60 * 1000);
}

export function convertToUTC(wibDate: Date | string): Date {
  const dateObj = new Date(wibDate); // pastikan input jadi Date object

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date format');
  }

  const wibOffset = 7; // WIB = UTC+7
  return new Date(dateObj.getTime() - wibOffset * 60 * 60 * 1000);
}
