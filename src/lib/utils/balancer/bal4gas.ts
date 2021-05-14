const ENDPOINT_BUDGET_SPENT =
  'https://api.balancer.finance/liquidity-mining/v1/gas/';
const BUDGET = 80000;

export async function isBudgetLeft(): Promise<boolean> {
  const response = await fetch(ENDPOINT_BUDGET_SPENT);
  const data = await response.json();
  const budgetLeft = data.success ? data.result < BUDGET : false;
  return budgetLeft;
}
