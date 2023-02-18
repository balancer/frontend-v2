/**
 * Extracts a pool's address from its poolId
 * @param poolId - a bytes32 string of the pool's ID
 * @returns the pool's address
 */
export const getPoolAddress = (poolId) => {
    if (poolId.length !== 66)
        throw new Error('Invalid poolId length');
    return poolId.slice(0, 42).toLowerCase();
};
export function poolIsLinearPool(poolType) {
    return poolType.includes('Linear');
}
export function poolHasVirtualSupply(poolType) {
    return poolType === 'PhantomStable' || poolIsLinearPool(poolType);
}
export function poolHasActualSupply(poolType) {
    return poolType === 'ComposableStable';
}
export function poolHasPercentFee(poolType) {
    return poolType === 'Element';
}
//# sourceMappingURL=pool.js.map