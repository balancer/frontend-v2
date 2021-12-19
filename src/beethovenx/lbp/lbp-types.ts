export interface LgeData {
  name: string;
  websiteUrl: string;
  tokenContractAddress: string;
  tokenIconUrl: string;
  twitterUrl: string;
  mediumUrl: string;
  discordUrl: string;
  telegramUrl: string;
  description: string;
  bannerImageUrl: string;

  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  collateralTokenAddress: string;

  tokenAmount: string;
  collateralAmount: string;

  tokenStartWeight: number;
  collateralStartWeight: number;
  tokenEndWeight: number;
  collateralEndWeight: number;
  swapFeePercentage: number;
  poolName: string;
  poolSymbol: string;
}
