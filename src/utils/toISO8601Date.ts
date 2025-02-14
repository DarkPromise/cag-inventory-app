import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

/**
 * Utility function to convert a date to ISO8601 date format (yyyy-mm-dd HH:mm:ss +08:00)
 * @param date The date to convert to Singapore time, defaults to current date
 * @returns The date in Singapore time as `yyyy-mm-dd HH:mm:ss`
 */
export const toISO8601Date = (date?: Date): string => {
  /** Day.js setup */
  dayjs.extend(utc);
  dayjs.extend(timezone);

  /** Convert to SG Time */
  return dayjs(date || new Date())
    .tz("Asia/Singapore")
    .format("YYYY-MM-DD HH:mm:ss Z");
};
