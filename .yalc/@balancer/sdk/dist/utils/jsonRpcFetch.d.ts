import { FunctionFragment, Interface } from '@ethersproject/abi';
import { SwapOptions } from '../types';
export declare function jsonRpcFetch<T>({ rpcUrl, from, to, contractInterface, functionFragment, values, options, }: {
    rpcUrl: string;
    from?: string;
    to: string;
    contractInterface: Interface;
    functionFragment: FunctionFragment | string;
    values?: ReadonlyArray<any>;
    options?: SwapOptions;
}): Promise<T>;
export declare function jsonRpcGetBlockTimestampByNumber({ rpcUrl, blockNumber, }: {
    rpcUrl: string;
    blockNumber: number;
}): Promise<number>;
