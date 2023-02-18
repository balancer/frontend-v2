import { default as retry } from 'async-retry';
import Timeout from 'await-timeout';
export async function fetchWithRetry(fetch, config = { timeout: 30000, retries: 2 }) {
    let response = null;
    await retry(async () => {
        const timeoutFunc = new Timeout();
        try {
            const fetchPromise = fetch();
            const timerPromise = timeoutFunc.set(config.timeout).then(() => {
                throw new Error(`Timed out during fetchWithRetry: ${config.timeout}`);
            });
            response = await Promise.race([fetchPromise, timerPromise]);
            return;
        }
        finally {
            timeoutFunc.clear();
        }
    }, {
        retries: config.retries,
        onRetry: (err, retry) => {
            console.log(err, retry);
        },
    });
    return response;
}
//# sourceMappingURL=fetch.js.map