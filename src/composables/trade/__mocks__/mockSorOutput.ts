import { mock } from 'jest-mock-extended';
import { ref } from 'vue';
import { UseSor } from '../useSor';

const useSorOutputMock = mock<UseSor>();

//@ts-ignore
useSorOutputMock.pools = ref([
  {
    id: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
    address: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5',
    tokens: [
      {
        id: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269-0xba485b556399123261a5f9c95d413b4f93107407',
        symbol: 'graviAURA',
        name: 'Gravitationally Bound AURA',
        decimals: 18,
        address: '0xba485b556399123261a5f9c95d413b4f93107407',
        balance: '27120.790137306811835668',
        managedBalance: '0',
        weight: '0.3334',
        priceRate: '1',
        isExemptFromYieldProtocolFee: null,
        token: {
          latestUSDPrice: '2.134056945116554709831454942129998',
          pool: null,
        },
      },
    ],
  },
]);

export default useSorOutputMock;
