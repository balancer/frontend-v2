export declare function fetchWithRetry<T>(fetch: () => Promise<T>, config?: {
    timeout: number;
    retries: number;
}): Promise<T | null>;
