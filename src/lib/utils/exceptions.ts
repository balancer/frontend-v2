export function logFetchException(failedFetchMessage: string, error: unknown) {
  console.trace(failedFetchMessage, {
    cause: error,
  });
}
