import { sleep } from '.';

export async function retryPromiseWithDelay<T>(
  promise: Promise<T>,
  retryCount: number,
  delayTime: number
): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    const responseStatusCode = (e as any)?.response?.status || 0;

    if (
      retryCount === 1 ||
      responseStatusCode === 404 ||
      responseStatusCode === 429
    ) {
      return Promise.reject(e);
    }
    console.log('retrying promise', retryCount, 'time');
    // wait for delayTime amount of time before calling this method again
    await sleep(delayTime);
    return retryPromiseWithDelay(promise, retryCount - 1, delayTime);
  }
}

export async function tryPromiseWithTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(reject, timeout)),
  ]);
}
