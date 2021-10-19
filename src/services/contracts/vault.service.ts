import { Contract } from '@ethersproject/contracts';
import {
  JsonRpcProvider,
  TransactionResponse,
  Web3Provider
} from '@ethersproject/providers';
import { Vault__factory, LidoRelayer__factory } from '@balancer-labs/typechain';
import configs from '@/lib/config';
import { SwapV2 } from '@balancer-labs/sor2';
import { SwapToken } from '../swap/swap.service';
import useWeb3 from '@/services/web3/useWeb3';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';

export default class VaultService {
  network: string;
  provider: Web3Provider;
  address: string;
  abi: any;
  signer: any;
  contract: any;
  contractWithSigner: any;

  constructor() {
    this.network = "homestead";
    this.address = configs[this.network].addresses.vault;
    this.abi = Vault__factory;
    const { getProvider } = useWeb3();
    this.provider = getProvider();
    this.signer = this.provider.getSigner();
    this.contract = new Contract(this.address, this.abi, this.provider);
    this.contractWithSigner = this.contract.connect(this.signer);
  }



  public async swap() {


  }

  public async batchSwap(
    tokenIn: SwapToken,
    tokenOut: SwapToken,
    swaps: SwapsV2[],
    tokenAddresses: string[]
  ) {

    const address = await this.signer.getAddress();

    const funds: FundManagement = {
      sender: address,
      recipient: address,
      fromInternalBalance: false,
      toInternalBalance: false
    };

  }


}

export const vaultService = new VaultService();