import { sub } from 'date-fns';

export const oneSecondInMs = 1000;
export const oneMinInMs = 60 * oneSecondInMs;
export const oneHourInMs = 60 * oneMinInMs;
export const oneDayInMs = 24 * oneHourInMs;
export const oneWeekInMs = 7 * oneDayInMs;

export const oneSecond = 1;
export const oneMinInSecs = 60 * oneSecond;
export const oneHourInSecs = 60 * oneMinInSecs;

export const twentyFourHoursInMs = 24 * oneHourInMs;
export const twentyFourHoursInSecs = twentyFourHoursInMs / oneSecondInMs;

export const timeNowInMs = Math.floor(Date.now() / oneSecondInMs);

export const oneYearInSecs = twentyFourHoursInSecs * 365;
export const oneWeekInSecs = twentyFourHoursInSecs * 7;

export const oneWeekAgoInSecs = () =>
  toUnixTimestamp(new Date().getTime() - oneWeekInMs);

export const weeksAgoInSecs = (weeks = 1) =>
  toUnixTimestamp(new Date().getTime() - oneWeekInMs * weeks);

export function dateTimeLabelFor(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZoneName: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function toJsTimestamp(unixTimestamp: number): number {
  return unixTimestamp * oneSecondInMs;
}

export function toUnixTimestamp(jsTimestamp: number): number {
  return Math.round(jsTimestamp / oneSecondInMs);
}

/**
 * Converts a the given string (format 2022-03-30) into a UNIX timestamp
 *
 * @param {string} date - Date string in format 2022-03-30
 * @returns {number} - Unix timestamp in seconds
 */
export function dateToUnixTimestamp(date: string): number {
  return Date.parse(date) / oneSecondInMs;
}

export function toUtcTime(date: Date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

export function getPreviousThursday(date: Date = new Date()): Date {
  let daysSinceThursday = date.getDay() - 4;
  if (daysSinceThursday < 0) daysSinceThursday += 7;

  return sub(date, {
    days: daysSinceThursday,
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  });
}

export function getTimestampSecondsFromNow(secs: number): number {
  return Math.ceil(Date.now() / 1000) + secs;
}

/**
 * Get seconds since given timestamp.
 *
 * @param {number} timestamp - Unix timestamp in seconds.
 */
export function getSecondsSince(timestamp: number): number {
  return Math.ceil(Date.now() / 1000) - timestamp;
}

export default function useTime() {
  return {
    oneSecondInMs,
    oneMinInMs,
    oneHourInMs,
    twentyFourHoursInMs,
    twentyFourHoursInSecs,
    // methods
    dateTimeLabelFor,
  };
}
