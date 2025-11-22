export class ClockUtils {

  static toLocalDateString(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  static addFromNow(milliseconds: number): Date {
    return new Date(ClockUtils.addFromNowTimestamp(milliseconds));
  }

  static addFromNowTimestamp(milliseconds: number): number {
    return Date.now() + milliseconds;
  }

  static add(date: Date, milliseconds: number): Date {
    return new Date(date.getTime() + milliseconds);
  }

  static ofDays(days: number): number {
    return days * 24 * 60 * 60 * 1000;
  }

  static ofHours(hours: number): number {
    return hours * 60 * 60 * 1000;
  }
}
