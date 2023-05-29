export type GasPrice = {
  price: number;
  maxPriorityFeePerGas?: number;
  maxFeePerGas?: number;
};

export type GasSettings = {
  gasPrice?: number;
  maxPriorityFeePerGas?: number;
  maxFeePerGas?: number;
  gasLimit?: number;
};
