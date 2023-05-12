import { isUserRejected } from '@/composables/useTransactionErrors';
import { configService } from '@/services/config/config.service';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

export class TransactionConcern {
  constructor(
    public readonly gasPrice = gasPriceService,
    public readonly rpcProviders = rpcProviderService,
    private readonly config = configService
  ) {}

  public shouldLogFailure(error): boolean {
    return this.config.env.APP_ENV !== 'development' && !isUserRejected(error);
  }
}
