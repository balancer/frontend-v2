export function getReasonAndBalErrorFromError(error: Error): {
  reason: string;
  balError: string | null;
} {
  const reason: string =
    (error as { reason?: string }).reason || 'no reason available';
  const balError = reason.match(/BAL#([0-9])\d\d/g);

  return {
    reason: reason,
    balError: balError && balError[0] ? balError[0] : null,
  };
}
