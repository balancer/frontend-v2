import { TokenInfoMap } from '@/types/TokenList';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { initMulticaller } from './Multicaller';

export const mockedOnchainTokenName = 'mocked onchain token name';

function buildOnchainMetadataMock(metadict: TokenInfoMap) {
  // TODO: discover how we can discover different calls and responses
  const result: TokenInfoMap = {};
  Object.keys(metadict).map(tokenAddress => {
    result[tokenAddress] = {
      address: tokenAddress,
      logoURI: '',
      chainId: 5,
      name: mockedOnchainTokenName,
      symbol: 'mocked onchain token symbol',
      decimals: 18,
    };
  });
  return result;
}

class MulticallerMock extends Multicaller {
  //@ts-ignore
  execute(metadict) {
    return Promise.resolve(buildOnchainMetadataMock(metadict));
  }
}

export function generateMulticallerMock() {
  return MulticallerMock;
}

export function initMulticallerWithDefaultMocks() {
  //@ts-ignore
  initMulticaller(generateMulticallerMock());
}
