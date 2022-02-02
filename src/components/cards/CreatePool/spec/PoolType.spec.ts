import { render } from '@testing-library/vue';
import PoolType from '../PoolType.vue';

jest.mock('vue-i18n', () => {
  return {
    createI18n: jest.fn(),
    useI18n: jest.fn().mockReturnValue({
      t: jest.fn().mockImplementation((key: string) => key)
    })
  };
});
jest.mock('@/locales');
jest.mock('@/services/web3/useWeb3', () => {
  return jest.fn().mockReturnValue({
    userNetworkConfig: {
      value: ''
    }
  });
});
jest.mock('@/composables/useTokens');
jest.mock('@/composables/pools/usePoolCreation', () => {
  return jest.fn().mockReturnValue({
    proceed: jest.fn(),
    type: {
      value: ''
    }
  });
});
jest.mock('@/composables/queries/usePoolsQuery');
jest.mock('@/services/balancer/balancer.service');
jest.mock('@/services/rpc-provider/rpc-provider.service');

describe('<PoolType />', () => {
  it('should render the weighted pool option and managed pool option', () => {
    const { getByText } = render(PoolType, {
      global: {
        mocks: {
          $t: jest.fn().mockImplementation((key: string) => key)
        }
      }
    });
    expect(getByText('Weighted pool')).toBeVisible();
    expect(getByText('Managed pool')).toBeVisible();
  });
});
