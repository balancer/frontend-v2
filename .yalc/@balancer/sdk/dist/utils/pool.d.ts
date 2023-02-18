/**
 * Extracts a pool's address from its poolId
 * @param poolId - a bytes32 string of the pool's ID
 * @returns the pool's address
 */
export declare const getPoolAddress: (poolId: string) => string;
export declare function poolIsLinearPool(poolType: string): boolean;
export declare function poolHasVirtualSupply(poolType: string): boolean;
export declare function poolHasActualSupply(poolType: string): boolean;
export declare function poolHasPercentFee(poolType: string): boolean;
