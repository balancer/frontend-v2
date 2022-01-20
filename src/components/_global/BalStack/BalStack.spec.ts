import { render } from '@testing-library/vue';
import BalStack from './BalStack.vue';

describe('BalStack', () => {
  describe('When using BalStack', () => {
    it('should render items horizontally when the horizontal prop is supplied', () => {
      const { getByText } = render(BalStack, {
        slots: {
          default: '<div>First</div><div>Second</div><div>Third</div>'
        }
      });

      // check that elements are actually rendered as children
      expect(getByText('First')).toBeVisible();
      expect(getByText('Second')).toBeVisible();
      expect(getByText('Third')).toBeVisible();
    });

    // it('should render items vertically when the vertical prop is supplied', () => {});

    // it('should render items with a space between them', () => {});

    // it('should render items with a border between them if withBorder prop is supplied', () => {});
  });
});
