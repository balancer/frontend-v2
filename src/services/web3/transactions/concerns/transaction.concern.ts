import { configService } from '@/services/config/config.service';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { WalletError } from '@/types';
import { ErrorCode } from '@ethersproject/logger';

const RPC_INVALID_PARAMS_ERROR_CODE = -32602;
const EIP1559_UNSUPPORTED_REGEX = /network does not support EIP-1559/i;

export class TransactionConcern {
  constructor(
    public readonly gasPrice = gasPriceService,
    public readonly rpcProviders = rpcProviderService,
    private readonly config = configService
  ) {}

  public shouldRetryAsLegacy(error: WalletError): boolean {
    return (
      error.code === RPC_INVALID_PARAMS_ERROR_CODE &&
      EIP1559_UNSUPPORTED_REGEX.test(error.message)
    );
  }

  public shouldLogFailure(error: WalletError): boolean {
    return (
      error.code === ErrorCode.UNPREDICTABLE_GAS_LIMIT &&
      this.config.env.APP_ENV !== 'development'
    );
  }
}
