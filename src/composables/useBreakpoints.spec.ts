import { mount } from '@tests/mount-composable-tester';

import useBreakpoints from './useBreakpoints';

describe('useBreakpoints', () => {
  it('Should load', () => {
    const { result } = mount(() => useBreakpoints());
    expect(result).toBeTruthy();
  });
});
