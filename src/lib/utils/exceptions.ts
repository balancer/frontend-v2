export function handleFetchException(
  failedFetchMessage: string,
  error: unknown
) {
  console.trace(failedFetchMessage, {
    cause: error,
  });
}
