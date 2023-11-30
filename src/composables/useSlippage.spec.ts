import useSlippage from './useSlippage';
import { mountComposable } from '@tests/mount-helpers';

vi.mock('@/providers/user-settings.provider');

describe('useSlippage', () => {
  const { result } = mountComposable(() => useSlippage());

  it('Should load', () => {
    expect(result).toBeTruthy();
  });

  describe('minusSlippage', () => {
    it('Should minus slippage correctly', () => {
      const value = result.minusSlippage('10000', 18);
      expect(value).toBe('9900.0');
    });

    it('Should not convert large values to scientific notation', () => {
      const value = result.minusSlippage(
        '2773323395126403492447232848118078909179',
        18
      );
      expect(value).toBe('2745590161175139457522760519636898120087.21');
    });
  });

  describe('minusSlippageScaled', () => {
    it('Should minus slippage correctly', () => {
      const value = result.minusSlippageScaled('10000');
      expect(value).toBe('9900');
    });

    it('Should not convert large values to scientific notation', () => {
      const value = result.minusSlippageScaled(
        '2773323395126403492447232848118078909179'
      );
      expect(value).toBe('2745590161175139457522760519636898120087');
    });
  });

  describe('addSlippage', () => {
    it('Should add slippage correctly', () => {
      const value = result.addSlippage('4000', 18);
      expect(value).toBe('4040.0');
    });

    it('Should not convert large values to scientific notation', () => {
      const value = result.addSlippage(
        '1234563395126403492447232848118078909179',
        18
      );
      expect(value).toBe('1246909029077667527371705176599259698270.79');
    });
  });

  describe('addSlippageScaled', () => {
    it('Should add slippage correctly', () => {
      const value = result.addSlippageScaled('5000');
      expect(value).toBe('5050');
    });

    it('Should not convert large values to scientific notation', () => {
      const value = result.addSlippageScaled(
        '1234563395126403492447232848118078909179'
      );
      expect(value).toBe('1246909029077667527371705176599259698270');
    });
  });
});
