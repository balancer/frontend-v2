// Do not display APR values greater than this amount; they are likely to be nonsensical
// These can arise from pools with extremely low balances (e.g., completed LBPs)
export const APR_THRESHOLD = 10000;
