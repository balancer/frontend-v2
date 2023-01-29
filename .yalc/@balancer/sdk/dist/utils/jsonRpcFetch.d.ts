import { FunctionFragment } from '@ethersproject/abi';
import { Interface } from '@ethersproject/abi';
export declare function jsonRpcFetch<T>({ rpcUrl, from, to, contractInterface, functionFragment, values, }: {
    rpcUrl: string;
    from?: string;
    to: string;
    contractInterface: Interface;
    functionFragment: FunctionFragment | string;
    values?: ReadonlyArray<any>;
}): Promise<T>;
