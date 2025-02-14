import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

/**
 * Utility function to convert a date from ISO8601 date format (yyyy-mm-dd HH:mm:ss Z)
 * to a Date object in Singapore time
 * @param dateStr The date string in ISO8601 format
 * @returns The date in Singapore time
 */
export const fromISO8601Date = (dateStr: string): Date => {
  /** Day.js setup */
  dayjs.extend(utc);
  dayjs.extend(timezone);

  return dayjs.tz(dateStr, "Asia/Singapore").toDate();
};
