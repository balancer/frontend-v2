import { SANCTIONED_ADDRESS } from '@tests/msw/handlers';
import { isBlockedAddress } from './web3.plugin';

describe('Given that VITE_WALLET_SCREENING is false', () => {
  beforeAll(() => {
    //@ts-ignore
    import.meta.env.VITE_WALLET_SCREENING = false;
  });

  it('skips sanctioned address check', async () => {
    const result = await isBlockedAddress(SANCTIONED_ADDRESS);
    expect(result).toBeFalsy();
  });
});

describe('Given that VITE_WALLET_SCREENING is true', () => {
  beforeAll(() => {
    //@ts-ignore
    import.meta.env.VITE_WALLET_SCREENING = true;
  });

  it('detects sanctioned address', async () => {
    const result = await isBlockedAddress(SANCTIONED_ADDRESS);
    expect(result).toBeTruthy();
  });

  it('allows non sanctioned address', async () => {
    const NOT_SANCTIONED_ADDRESS = 'vitalic.eth';
    const result = await isBlockedAddress(NOT_SANCTIONED_ADDRESS);
    expect(result).toBeFalsy();
  });
});
