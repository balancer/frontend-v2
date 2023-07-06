import { isUserError } from '@/composables/useTransactionErrors';
import { configService } from '@/services/config/config.service';
import { gasService } from '@/services/gas/gas.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

export class TransactionConcern {
  constructor(
    public readonly gas = gasService,
    public readonly rpcProviders = rpcProviderService,
    private readonly config = configService
  ) {}

  public shouldLogFailure(error): boolean {
    return this.config.env.APP_ENV !== 'development' && !isUserError(error);
  }
}
