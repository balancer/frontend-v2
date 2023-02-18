import fetch from 'isomorphic-fetch';
import { ZERO_ADDRESS } from './constants';
import { hexlify } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
export async function jsonRpcFetch({ rpcUrl, from = ZERO_ADDRESS, to, contractInterface, functionFragment, values, options, }) {
    const data = contractInterface.encodeFunctionData(functionFragment, values);
    let block;
    if (options?.block) {
        block = hexlify(options.block);
    }
    else {
        block = 'latest';
    }
    const rawResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'eth_call',
            params: [{ from, to, data }, block],
        }),
    });
    const content = await rawResponse.json();
    return contractInterface.decodeFunctionResult('getPoolData', content.result);
}
export async function jsonRpcGetBlockTimestampByNumber({ rpcUrl, blockNumber, }) {
    const rawResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'eth_getBlockByNumber',
            params: [hexlify(blockNumber), false],
        }),
    });
    const content = await rawResponse.json();
    return BigNumber.from(content.result.timestamp).toNumber();
}
//# sourceMappingURL=jsonRpcFetch.js.map