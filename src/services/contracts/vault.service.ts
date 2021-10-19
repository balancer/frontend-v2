import { Contract } from '@ethersproject/contracts';
import {
  JsonRpcProvider,
  TransactionResponse,
  Web3Provider
} from '@ethersproject/providers';
import { MaxUint256 } from '@ethersproject/constants';
import { Vault__factory } from '@balancer-labs/typechain';
import configs from '@/lib/config';
import { SwapV2 } from '@balancer-labs/sor2';
import { SwapToken } from '../swap/swap.service';
import useWeb3 from '@/services/web3/useWeb3';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';
import { contractCaller } from './contract-caller.service';

export class VaultService {
  network: string;
  provider: Web3Provider | null;
  address: string;
  abi: any;
  signer: any;
  contract: any;
  contractWithSigner: any;

  constructor() {
    this.network = "homestead";
    this.address = configs[this.network].addresses.vault;
    this.abi = Vault__factory;
    this.provider = null;
    this.initializeContract();
  }

  public initializeContract() {
    const { getProvider } = useWeb3();
    this.provider = getProvider();
    this.signer = this.provider.getSigner();
    this.contract = new Contract(this.address, this.abi, this.provider);
    this.contractWithSigner = this.contract.connect(this.signer);
  }

  public async swap(
    single: SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    options: Record<string, any> = {}
  ) {
    return contractCaller.sendTransaction(
      this.address,
      this.abi,
      'swap',
      [single, funds, tokenOutAmount, MaxUint256],
      options
    );
  }

  public async batchSwap(
    swapKind: SwapKind,
    swaps: SwapV2[],
    tokenAddresses: string[],
    funds: FundManagement,
    limits: string[],
    options: Record<string, any> = {}
  ) {
    return contractCaller.sendTransaction(
      this.address,
      this.abi,
      'batchSwap',
      [swapKind, swaps, tokenAddresses, funds, limits, MaxUint256],
      options
    );
  }


}

export const vaultService = new VaultService();