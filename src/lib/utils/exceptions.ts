export function handleFetchException(failedFetchMessage: string, error) {
  console.trace(failedFetchMessage, {
    cause: error,
  });
  throw error;
}
