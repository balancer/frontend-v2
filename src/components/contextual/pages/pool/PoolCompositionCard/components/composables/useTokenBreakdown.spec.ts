import { removeBptFrom } from '@/composables/usePool';
import * as tokensProvider from '@/providers/tokens.provider';
import { Pool } from '@/services/pool/types';
import { BoostedPoolMock } from '@/__mocks__/pool';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposable } from '@tests/mount-helpers';
import { ref } from 'vue';
import { useTokenBreakdown } from './useTokenBreakdown';

const bptBalance = '10';

vi.mock('@/providers/tokens.provider', () => {
  return {
    useTokens() {
      return {
        balanceFor: () => bptBalance,
        priceFor: () => 2,
      };
    },
  };
});

vi.mock('@ethersproject/address', () => {
  return {
    getAddress: address => address,
  };
});

const rootPool = BoostedPoolMock;
// Values used to calculate userPoolPercentage (15)
rootPool.totalLiquidity = '100';
rootPool.totalShares = '100';

const bbaDaiAddress = '0xae37d54ae477268b9997d4161b96b8200755935c';

function mountTokenBreakdown(pool: Pool) {
  const { result } = mountComposable(() =>
    useTokenBreakdown(ref(removeBptFrom(pool)))
  );
  return result;
}

it('Works for a parent token in a deep nested pool', async () => {
  const data = mountTokenBreakdown(rootPool);

  const bbaDaiData = data.value[bbaDaiAddress];

  // Hides parent token balance and fiat
  expect(bbaDaiData.balanceLabel).toEqual('');
  expect(bbaDaiData.userBalanceLabel).toEqual('');
  expect(bbaDaiData.fiatLabel).toEqual('');
  expect(bbaDaiData.userFiatLabel).toEqual('');
  expect(bbaDaiData.tokenWeightLabel).toEqual('');
});

describe('Given a boosted pool with a deep bb-a-DAI linear token, useTokenBreakdown works', () => {
  it('for wrapped tokens (aDAi)', async () => {
    const aDaiAddress = '0x02d60b84491589974263d922d9cc7a3152618ef6';
    const data = mountTokenBreakdown(rootPool);

    const aDaiData = data.value[aDaiAddress];
    expect(aDaiData.balanceLabel).toEqual('24,104');
    expect(aDaiData.userBalanceLabel).toEqual('3,615.6517');
    //useTokens global mock is mocking priceFor to return 2
    // so fiat should be double the balance
    expect(aDaiData.fiatLabel).toEqual('$48,209');
    expect(aDaiData.userFiatLabel).toEqual('$7,231.30');

    expect(aDaiData.tokenWeightLabel).toEqual('');
  });

  it('for a non wrapped token (DAI)', async () => {
    const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
    const data = mountTokenBreakdown(rootPool);

    const daiData = data.value[daiAddress];

    expect(daiData.balanceLabel).toEqual('17,695');
    //useTokens global mock is mocking priceFor to return 2
    // so fiat should be double the balance
    expect(daiData.fiatLabel).toEqual('$35,389');

    expect(daiData.tokenWeightLabel).toEqual('');
  });
});

describe('Given a weighted pool (GRO-WETH)', () => {
  const rootPool = aWeightedPool();
  const groAddress = '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  it('works for GRO token', () => {
    const data = mountTokenBreakdown(rootPool);

    const groData = data.value[groAddress];

    expect(groData.balanceLabel).toEqual('408,785');
    expect(groData.fiatLabel).toEqual('$817,569');

    expect(groData.tokenWeightLabel).toEqual('80.00%');
  });

  it('works for WETH token', () => {
    const data = mountTokenBreakdown(rootPool);

    const wethData = data.value[wethAddress];
    expect(wethData.balanceLabel).toEqual('95.0941');
    expect(wethData.fiatLabel).toEqual('$190.19');

    expect(wethData.tokenWeightLabel).toEqual('20.00%');
  });

  it('Uses latestUSDPrice when the token price is not defined (fiat value is zero because priceFor returns zero when token price not found)', () => {
    //@ts-ignore
    vi.spyOn(tokensProvider, 'useTokens').mockReturnValueOnce({
      priceFor: () => 0,
    });

    const data = mountTokenBreakdown(rootPool);
    const groData = data.value[groAddress];

    expect(groData.balanceLabel).toEqual('408,785');
    expect(groData.fiatLabel).toEqual('$437,400'); // balance x latestUSDPrice = 408,785 x 1.07 = $437,400
  });

  it('calculates token percentage', () => {
    rootPool.totalLiquidity = '1900';
    const data = mountTokenBreakdown(rootPool);

    const wethData = data.value[wethAddress];
    const groData = data.value[groAddress];

    // (token balance / total balance) * 100
    expect(wethData.getTokenPercentageLabel()).toEqual('0.02%');
    expect(groData.getTokenPercentageLabel()).toEqual('99.98%');
  });
});

test('recalculates data when pool changes', async () => {
  const pool = removeBptFrom(aWeightedPool());
  pool.tokens[0].balance = '40000';
  pool.tokens[1].balance = '50000';

  const rootPool = ref(pool);
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  const { result } = mountComposable(() => useTokenBreakdown(rootPool));

  let wethData = result.value[wethAddress];

  expect(wethData.getTokenPercentageLabel()).toBe('55.56%');
  expect(wethData.balanceLabel).toBe('50,000');

  // Refetch pool with different balance
  rootPool.value = removeBptFrom(aWeightedPool());

  wethData = result.value[wethAddress];

  expect(wethData.balanceLabel).toBe('95.0941');
  expect(wethData.getTokenPercentageLabel()).toBe('0.02%');
});
