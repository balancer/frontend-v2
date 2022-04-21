export interface LinearPool {
  calcBoostedAPR(
    mainToken: string,
    wrappedToken: string,
    wrappedTokenBalance: string,
    totalLiquidity: string,
    price: string
  ): Promise<string>;
}
