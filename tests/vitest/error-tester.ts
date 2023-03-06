export function catchError(callback) {
  let error: Error | null = null;
  try {
    callback();
  } catch (e) {
    if (e instanceof Error) error = e;
  }
  return error;
}

export async function catchAsyncError<T>(callback: () => Promise<T>) {
  let error: Error | null = null;
  try {
    await callback();
  } catch (e) {
    if (e instanceof Error) error = e;
  }
  return error;
}
