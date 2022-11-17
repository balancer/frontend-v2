import { findMainTokenAddress, removeBptFrom } from '@/composables/usePool';
import { PoolToken } from '@/services/pool/types';
import { BoostedPoolMock, PoolMock } from '@/__mocks__/pool';
import { ref } from 'vue';
import { mount } from 'vue-composable-tester';
import { useTokenBreakdown } from './useTokenBreakdown';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import useTokens from '@/composables/useTokens';

// TODO: refactor providers to avoid mocking useTokens
jest.mock('@/composables/useTokens');

const bbaDaiToken = removeBptFrom(BoostedPoolMock).tokens[2];
const isDeepPool = ref(true);

it('Works for a parent token in a deep nested pool', async () => {
  const token = ref(bbaDaiToken);
  const parentTotalShare = ref(BoostedPoolMock.totalShares);
  const mainTokenAddress = ref('');
  const { result } = mount(() =>
    useTokenBreakdown(token, parentTotalShare, mainTokenAddress, isDeepPool)
  );

  // Hides parent token balance and fiat
  expect(result.balanceLabel.value).toEqual('');
  expect(result.fiatLabel.value).toEqual('');

  expect(result.tokenWeightLabel.value).toEqual('');
});

describe('Given a boosted pool with a deep bb-a-DAI linear token, useTokenBreakdown works', () => {
  const mainTokenAddress = ref(findMainTokenAddress(bbaDaiToken.token.pool));
  const parentTotalShare = ref(bbaDaiToken.token.pool?.totalShares as string);

  it('for wrapped tokens (aDAi)', async () => {
    const aDaiToken = ref(bbaDaiToken.token.pool?.tokens?.[0] as PoolToken);
    const { result } = mount(() =>
      useTokenBreakdown(
        aDaiToken,
        parentTotalShare,
        mainTokenAddress,
        isDeepPool
      )
    );

    expect(result.balanceLabel.value).toEqual('13,324');
    //useTokens global mock is mocking priceFor to return 2
    // so fiat should be double the balance
    expect(result.fiatLabel.value).toEqual('$26,648');

    expect(result.tokenWeightLabel.value).toEqual('');
  });

  it('for a non wrapped token (DAI)', async () => {
    const daiToken = ref(bbaDaiToken.token.pool?.tokens?.[1] as PoolToken);
    const { result } = mount(() =>
      useTokenBreakdown(
        daiToken,
        parentTotalShare,
        mainTokenAddress,
        isDeepPool
      )
    );

    expect(result.balanceLabel.value).toEqual('7,179.966');
    //useTokens global mock is mocking priceFor to return 2
    // so fiat should be double the balance
    expect(result.fiatLabel.value).toEqual('$14,360');

    expect(result.tokenWeightLabel.value).toEqual('');
  });
});

describe('Given a weighted pool (GRO-WETH)', () => {
  const parentTotalShare = ref(PoolMock.totalShares);
  const mainTokenAddress = ref('');
  const isDeepPool = ref(false);

  it('for GRO token', () => {
    const groToken = removeBptFrom(PoolMock).tokens[0];
    const token = ref(groToken);
    const { result } = mount(() =>
      useTokenBreakdown(token, parentTotalShare, mainTokenAddress, isDeepPool)
    );

    expect(result.balanceLabel.value).toEqual('408,785');
    expect(result.fiatLabel.value).toEqual('$817,569');

    expect(result.tokenWeightLabel.value).toEqual('80.00%');
  });

  it('works for WETH token', () => {
    const wethToken = removeBptFrom(PoolMock).tokens[1];
    const token = ref(wethToken);
    const { result } = mount(() =>
      useTokenBreakdown(token, parentTotalShare, mainTokenAddress, isDeepPool)
    );

    expect(result.balanceLabel.value).toEqual('95.0941');
    expect(result.fiatLabel.value).toEqual('$190.19');

    expect(result.tokenWeightLabel.value).toEqual('20.00%');
  });

  it('works WETH token', () => {
    const wethToken = removeBptFrom(PoolMock).tokens[1];
    const token = ref(wethToken);
    const { result } = mount(() =>
      useTokenBreakdown(token, parentTotalShare, mainTokenAddress, isDeepPool)
    );

    expect(result.balanceLabel.value).toEqual('95.0941');
    expect(result.fiatLabel.value).toEqual('$190.19');

    expect(result.tokenWeightLabel.value).toEqual('20.00%');
  });

  it('Returns - when the token price is not defined (fiat value is zero because priceFor returns zero when token price not found)', () => {
    //@ts-ignore
    useTokens = () => ({
      priceFor: () => 0,
    });

    const groToken = removeBptFrom(PoolMock).tokens[0];
    const token = ref(groToken);
    const { result } = mount(() =>
      useTokenBreakdown(token, parentTotalShare, mainTokenAddress, isDeepPool)
    );
    expect(result.fiatLabel.value).toEqual('-');
  });
});
