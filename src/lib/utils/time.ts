// Converts a the given string (format 2022-03-30) into a UNIX timestamp
export function toEpochTimestamp(date: string) {
  return Date.parse(date) / 1000;
}
