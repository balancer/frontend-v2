export const oneSecondInMs = 1000;
export const oneMinInMs = 60 * oneSecondInMs;
export const oneHourInMs = 60 * oneMinInMs;

export const twentyFourHoursInMs = 24 * oneHourInMs;
export const twentyFourHoursInSecs = twentyFourHoursInMs / oneSecondInMs;

export const timeNowInMs = Math.floor(Date.now() / oneSecondInMs);

export default function useTime() {
  return {
    oneSecondInMs,
    oneMinInMs,
    oneHourInMs,
    twentyFourHoursInMs,
    twentyFourHoursInSecs
  };
}
