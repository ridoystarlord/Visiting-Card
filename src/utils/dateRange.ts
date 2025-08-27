import { DateTime } from 'luxon';

export enum ReportType {
  DAILY = 'daily',
  LASTDAY = 'lastday',
  LAST7DAYS = 'last7days',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  LAST_MONTH = 'lastmonth',
  CUSTOM = 'custom',
}

/**
 * Get date range for different report types
 * @param type Report type
 * @param startDate Start date for custom report (ISO string)
 * @param endDate End date for custom report (ISO string)
 * @returns Object with gte (start) and lt (end) DateTime objects
 */
export function getDateRange(
  type: ReportType,
  startDate?: string,
  endDate?: string,
) {
  // Bangladesh timezone
  const TIMEZONE = 'Asia/Dhaka';

  // Get current date in Bangladesh timezone
  const today = DateTime.now().setZone(TIMEZONE);

  // Starting points for different periods
  const startOfToday = today.startOf('day');
  const endOfToday = today.endOf('day').plus({ milliseconds: 1 }); // Start of next day
  const startOfYesterday = today.minus({ days: 1 }).startOf('day');
  const startOfWeek = today.startOf('week');
  const endOfWeek = startOfWeek.plus({ weeks: 1 });
  const startOfMonth = today.startOf('month');
  const endOfMonth = today.endOf('month').plus({ milliseconds: 1 }); // Start of next month
  const startOfLastMonth = today.minus({ months: 1 }).startOf('month');
  const endOfLastMonth = today.startOf('month');
  const startOfLast7Days = today.minus({ days: 6 }).startOf('day');

  // Handle different report types
  switch (type) {
    case ReportType.DAILY:
      return {
        gte: toUtcDateOnly(startOfToday),
        lt: toUtcDateOnly(endOfToday),
      };

    case ReportType.LASTDAY:
      return {
        gte: toUtcDateOnly(startOfYesterday),
        lt: toUtcDateOnly(startOfToday),
      };

    case ReportType.LAST7DAYS:
      return {
        gte: toUtcDateOnly(startOfLast7Days),
        lt: toUtcDateOnly(endOfToday),
      };

    case ReportType.WEEKLY:
      return {
        gte: toUtcDateOnly(startOfWeek),
        lt: toUtcDateOnly(endOfWeek),
      };

    case ReportType.MONTHLY:
      return {
        gte: toUtcDateOnly(startOfMonth),
        lt: toUtcDateOnly(endOfMonth),
      };

    case ReportType.LAST_MONTH:
      return {
        gte: toUtcDateOnly(startOfLastMonth),
        lt: toUtcDateOnly(endOfLastMonth),
      };

    case ReportType.CUSTOM:
      if (!startDate || !endDate) {
        throw new Error(
          'Start date and end date are required for custom report',
        );
      }

      try {
        // Parse dates in Bangladesh timezone
        const start = DateTime.fromISO(startDate, { zone: TIMEZONE }).startOf(
          'day',
        );
        const end = DateTime.fromISO(endDate, { zone: TIMEZONE }).startOf(
          'day',
        );

        if (!start.isValid || !end.isValid) {
          throw new Error('Invalid date format');
        }

        if (start > end) {
          throw new Error('Start date must be before end date');
        }

        return {
          gte: toUtcDateOnly(start),
          lt: toUtcDateOnly(end.plus({ days: 1 })), // inclusive end
        };
      } catch (error) {
        throw new Error(`Error processing custom dates: ${error.message}`);
      }

    default:
      throw new Error('Invalid report type');
  }
}

export function toUtcDateOnly(dt: DateTime): Date {
  return DateTime.fromObject(
    { year: dt.year, month: dt.month, day: dt.day },
    { zone: 'utc' },
  ).toJSDate();
}
