import { FunctionFragment } from '@ethersproject/abi';
import { Interface } from '@ethersproject/abi';
import { LoadPoolsOptions } from '../data/types';
export declare function jsonRpcFetch<T>({ rpcUrl, from, to, contractInterface, functionFragment, values, options, }: {
    rpcUrl: string;
    from?: string;
    to: string;
    contractInterface: Interface;
    functionFragment: FunctionFragment | string;
    values?: ReadonlyArray<any>;
    options?: LoadPoolsOptions;
}): Promise<T>;
