import configs from '@/lib/config';
import { defaultAbiCoder } from '@ethersproject/abi';
import { default as WeightedPoolContractSource } from '@/beethovenx/contracts/weightedPool.json';
import { default as WeightedPoolAbi } from '@/beethovenx/abi/WeightedPool.json';
import { sleep } from '@/lib/utils';
import { callStatic } from '@/lib/utils/balancer/web3';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';

interface EtherscanVerifyRequest {
  apikey: string;
  module: 'contract';
  action: 'verifysourcecode';
  contractaddress: string;
  sourceCode: string;
  codeformat: 'solidity-standard-json-input';
  contractname: string;
  compilerversion: string;
  // This is misspelt in Etherscan's actual API parameters.
  // See: https://etherscan.io/apis#contracts
  constructorArguements: string;
}

export const BUFFER_PERIOD_DURATION = 60 * 60 * 24 * 30;

interface EtherscanCheckStatusRequest {
  apikey: string;
  module: 'contract';
  action: 'checkverifystatus';
  guid: string;
}

export class PoolVerifierService {
  network: string;
  vaultAddress: string;
  weightedPoolFactoryAddress: string;
  etherscanApiKey: string;
  etherscanApiUrl: string;

  constructor(network: string) {
    this.network = network;
    this.vaultAddress = configs[network].addresses.vault;
    this.weightedPoolFactoryAddress =
      configs[network].addresses.weightedPoolFactory;

    this.etherscanApiKey = configs[network].etherscan.apiKey;
    this.etherscanApiUrl = configs[network].etherscan.apiUrl;
  }

  public async verifyPool(
    provider: Web3Provider | JsonRpcProvider,
    name: string,
    symbol: string,
    owner: string,
    tokens: string[],
    weights: BigNumber[],
    swapFeePercentage: BigNumber,
    poolAddress: string,
    blockHash: string
  ) {
    const argTypes =
      (WeightedPoolAbi[0].inputs as { type: string }[]).map(
        input => input.type
      ) || [];

    const pauseWindowDuration = await this.getPauseWindowDuration(
      provider,
      poolAddress,
      blockHash
    );

    const constructorArguements = defaultAbiCoder
      .encode(argTypes, [
        this.vaultAddress,
        name,
        symbol,
        tokens,
        weights,
        swapFeePercentage,
        pauseWindowDuration,
        BUFFER_PERIOD_DURATION,
        owner
      ])
      .replace('0x', '');

    const request: EtherscanVerifyRequest = {
      apikey: this.etherscanApiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: poolAddress,
      sourceCode: JSON.stringify(WeightedPoolContractSource),
      codeformat: 'solidity-standard-json-input',
      contractname: `contracts/pools/weighted/WeightedPool.sol:WeightedPool`,
      compilerversion: 'v0.7.1+commit.f4a555be',
      constructorArguements
    };

    const response = await this.verifyContract(this.etherscanApiUrl, request);

    console.log('response json', response);

    const pollRequest = this.toCheckStatusRequest({
      apiKey: this.etherscanApiKey,
      guid: response.result
    });

    await sleep(700);

    const verificationStatus = await this.getVerificationStatus(
      this.etherscanApiUrl,
      pollRequest
    );

    console.log('verification status', verificationStatus);
  }

  private async getPauseWindowDuration(
    provider: Web3Provider | JsonRpcProvider,
    poolAddress: string,
    blockHash: string
  ) {
    const pausedState = await callStatic(
      provider,
      poolAddress,
      WeightedPoolAbi,
      'getPausedState',
      []
    );

    const pauseWindowEndTime = (pausedState.pauseWindowEndTime as BigNumber).toNumber();
    console.log('block hash', blockHash);
    const block = await provider.send('eth_getBlockByHash', [blockHash, true]);
    console.log('block', block);
    const blockTimestamp = BigNumber.from(block.timestamp).toNumber();

    const pauseWindowDuration = pauseWindowEndTime - blockTimestamp;

    return pauseWindowDuration < 0 ? 0 : pauseWindowDuration;
  }

  private async verifyContract(
    url: string,
    req: EtherscanVerifyRequest
  ): Promise<any> {
    const parameters = new URLSearchParams({ ...req });
    const requestDetails = { method: 'post', body: parameters };

    let response: Response;
    try {
      response = await fetch(url, requestDetails);
      console.log('response', response);
    } catch (error) {
      throw Error(
        // @ts-ignore
        `Failed to send verification request. Reason: ${error.message}`
      );
    }

    if (!response.ok) {
      const responseText = await response.text();
      throw Error(
        `Failed to send verification request.\nHTTP code: ${response.status}.\nResponse: ${responseText}`
      );
    }

    return response.json();
  }

  private toCheckStatusRequest(params: {
    apiKey: string;
    guid: string;
  }): EtherscanCheckStatusRequest {
    return {
      apikey: params.apiKey,
      module: 'contract',
      action: 'checkverifystatus',
      guid: params.guid
    };
  }

  private async getVerificationStatus(
    url: string,
    req: EtherscanCheckStatusRequest
  ): Promise<any> {
    const parameters = new URLSearchParams({ ...req });
    const urlWithQuery = new URL(url);
    urlWithQuery.search = parameters.toString();

    const response = await fetch(urlWithQuery.toString());

    if (!response.ok) {
      // This could be always interpreted as JSON if there were any such guarantee in the Etherscan API.
      const responseText = await response.text();
      throw new Error(
        `The HTTP server response is not ok. Status code: ${response.status} Response text: ${responseText}`
      );
    }

    return response.json();
  }
}
