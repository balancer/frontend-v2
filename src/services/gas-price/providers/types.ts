export type GasPrice = {
  price: number;
  maxPriorityFeePerGas?: number;
  maxFeePerGas?: number;
};

export type GasPriceEstimation = {
  pricePerGwei: number;
  standardPriceGwei: number;
  fastPriceGwei: number;
  rapidPriceGwei: number;
};
