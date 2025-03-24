export function isPastDays(startDate: Date, days: number): boolean {
    const now = new Date();
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + days);

    return now.getTime() > targetDate.getTime();
}

export function pastDaysCount(startDate: Date): number {
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
}

export function isOutsideBusinessHours(date: Date): boolean {
    const hours = date.getHours();
    const startHour = 8;
    const endHour = 17;

    console.log(`hour ${hours}`);
    console.log(`starthour ${startHour}`);
    console.log(`end hour ${endHour}`);


    return hours < startHour || hours >= endHour;
}
