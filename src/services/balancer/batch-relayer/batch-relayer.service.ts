import { VaultActionsService } from './extensions/vault-actions.service';
import { AaveWrappingService } from './extensions/aave-wrapping.service';
import { YearnWrappingService } from './extensions/yearn-wrapping.service';
import {
  EncodeGaugeDepositInput,
  EncodeGaugeWithdrawInput,
  EncodeReaperUnwrapInput,
  EncodeReaperWrapInput,
  EncodeUnwrapErc4626Input,
  EncodeWrapErc4626Input,
} from './relayer-types';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { ReaperWrappingService } from './extensions/reaper-wrapping.service';
import { Erc4626WrappingService } from './extensions/erc4626-wrapping.service';
import { GaugeActionsService } from './extensions/gauge-actions.service';
import BatchRelayerLibraryAbi from './abi/BatchRelayerLibrary.json';
import BatchRelayerAbi from './abi/BatchRelayer.json';
import { Interface } from '@ethersproject/abi';
import { JsonRpcSigner } from '@ethersproject/providers';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { EulerWrappingService } from '@/services/balancer/batch-relayer/extensions/euler-wrapping.service';
import { GearboxWrappingService } from '@/services/balancer/batch-relayer/extensions/gearbox-wrapping.service';
import { SiloWrappingService } from '@/services/balancer/batch-relayer/extensions/silo-wrapping.service';
import { TetuWrappingService } from '@/services/balancer/batch-relayer/extensions/tetu-wrapping.service';

export enum LinearPoolType {
  AaveLinear = 'AaveLinear',
  EulerLinear = 'EulerLinear',
  ERC4626Linear = 'ERC4626Linear',
  BeefyLinear = 'BeefyLinear',
  GearboxLinear = 'GearboxLinear',
  MidasLinear = 'MidasLinear',
  ReaperLinear = 'ReaperLinear',
  SiloLinear = 'SiloLinear',
  TetuLinear = 'TetuLinear',
  YearnLinear = 'YearnLinear',
}

export class BatchRelayerService {
  private readonly CHAINED_REFERENCE_PREFIX = 'ba11';
  private readonly TEMP_CHAINED_REFERENCE_PREFIX = 'ba10';
  private readonly vaultActionsService: VaultActionsService;
  private readonly aaveWrappingService: AaveWrappingService;
  private readonly yearnWrappingService: YearnWrappingService;
  private readonly reaperWrappingService: ReaperWrappingService;
  private readonly erc4626WrappingService: Erc4626WrappingService;
  private readonly eulerWrappingService: EulerWrappingService;
  private readonly gearboxWrappingService: GearboxWrappingService;
  private readonly siloWrappingService: SiloWrappingService;
  private readonly tetuWrappingService: TetuWrappingService;
  private readonly gaugeStakingService: GaugeActionsService;

  constructor() {
    this.vaultActionsService = new VaultActionsService();
    this.aaveWrappingService = new AaveWrappingService();
    this.yearnWrappingService = new YearnWrappingService();
    this.reaperWrappingService = new ReaperWrappingService();
    this.erc4626WrappingService = new Erc4626WrappingService();
    this.eulerWrappingService = new EulerWrappingService();
    this.gearboxWrappingService = new GearboxWrappingService();
    this.siloWrappingService = new SiloWrappingService();
    this.tetuWrappingService = new TetuWrappingService();
    this.gaugeStakingService = new GaugeActionsService();
  }

  public toChainedReference(key: BigNumberish): BigNumber {
    // The full padded prefix is 66 characters long, with 64 hex characters and the 0x prefix.
    const paddedPrefix = `0x${this.TEMP_CHAINED_REFERENCE_PREFIX}${'0'.repeat(
      64 - this.TEMP_CHAINED_REFERENCE_PREFIX.length
    )}`;
    return BigNumber.from(paddedPrefix).add(key);
  }

  public toPersistentChainedReference(key: BigNumberish): BigNumber {
    // The full padded prefix is 66 characters long, with 64 hex characters and the 0x prefix.
    const paddedPrefix = `0x${this.CHAINED_REFERENCE_PREFIX}${'0'.repeat(
      64 - this.CHAINED_REFERENCE_PREFIX.length
    )}`;
    return BigNumber.from(paddedPrefix).add(key);
  }

  public encodePeekChainedReferenceValue(reference: BigNumberish): string {
    const relayerLibrary = new Interface(BatchRelayerLibraryAbi);

    return relayerLibrary.encodeFunctionData('peekChainedReferenceValue', [
      reference,
    ]);
  }

  public gaugeEncodeDeposit(params: EncodeGaugeDepositInput): string {
    return this.gaugeStakingService.encodeDeposit(params);
  }

  public gaugeEncodeWithdraw(params: EncodeGaugeWithdrawInput): string {
    return this.gaugeStakingService.encodeWithdraw(params);
  }

  public reaperEncodeWrap(params: EncodeReaperWrapInput): string {
    return this.reaperWrappingService.encodeWrap(params);
  }

  public reaperEncodeUnwrap(params: EncodeReaperUnwrapInput): string {
    return this.reaperWrappingService.encodeUnwrap(params);
  }

  public erc4626EncodeWrap(params: EncodeWrapErc4626Input): string {
    return this.erc4626WrappingService.encodeWrap(params);
  }

  public erc4626EncodeUnwrap(params: EncodeUnwrapErc4626Input): string {
    return this.erc4626WrappingService.encodeUnwrap(params);
  }

  public unwrapLinearPoolWrappedToken({
    signer,
    batchRelayerAddress,
    wrappedToken,
    poolType,
    sender,
    recipient,
    amount,
  }: {
    signer: JsonRpcSigner;
    batchRelayerAddress: string;
    wrappedToken: string;
    poolType: LinearPoolType;
    sender: string;
    recipient: string;
    amount: BigNumberish;
  }) {
    const txBuilder = new TransactionBuilder(signer);
    let call = '';

    if (
      poolType === LinearPoolType.ReaperLinear ||
      poolType === LinearPoolType.BeefyLinear
    ) {
      call = this.reaperEncodeUnwrap({
        vaultToken: wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
      });
    } else if (poolType === LinearPoolType.ERC4626Linear) {
      call = this.erc4626EncodeUnwrap({
        wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
      });
    } else if (poolType === LinearPoolType.AaveLinear) {
      call = this.aaveWrappingService.encodeUnwrap({
        staticToken: wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
        toUnderlying: true,
      });
    } else if (poolType === LinearPoolType.YearnLinear) {
      call = this.yearnWrappingService.encodeUnwrap({
        vaultToken: wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
      });
    } else if (poolType === LinearPoolType.EulerLinear) {
      call = this.eulerWrappingService.encodeUnwrap({
        wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
      });
    } else if (poolType === LinearPoolType.TetuLinear) {
      call = this.tetuWrappingService.encodeUnwrap({
        wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
      });
    } else if (poolType === LinearPoolType.GearboxLinear) {
      call = this.gearboxWrappingService.encodeUnwrap({
        wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
      });
    } else if (poolType === LinearPoolType.SiloLinear) {
      call = this.siloWrappingService.encodeUnwrap({
        wrappedToken,
        sender,
        recipient,
        amount,
        outputReference: 0,
      });
    } else {
      throw new Error(
        'unwrapLinearPoolWrappedToken: Unsupported linear pool type'
      );
    }

    const batchRelayerInterface = new Interface(BatchRelayerAbi);

    return txBuilder.raw.sendTransaction({
      to: batchRelayerAddress,
      data: batchRelayerInterface.encodeFunctionData('multicall', [[call]]),
    });
  }
}
