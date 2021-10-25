const ENDPOINT_BUDGET_SPENT =
  'https://api.balancer.finance/liquidity-mining/v1/gas/';
// The program's budget is 80k BAL. To avoid someone seeing
// the message but ultimately not getting the reimbursement
// we add a safety margin and stop showing the message @ 79.5k
const BUDGET_THRESHOLD = 79500;

export async function isBudgetLeft(): Promise<boolean> {
  const response = await fetch(ENDPOINT_BUDGET_SPENT);
  const data = await response.json();
  const budgetLeft = data.success ? data.result < BUDGET_THRESHOLD : false;
  return budgetLeft;
}
