import { createProviderComponent } from './providers/createProviderComponent';
import { provideWallets } from './providers/wallet.provider';

export default createProviderComponent(() => {
  provideWallets();
});
