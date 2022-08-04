import { render } from '@testing-library/vue';

import BalStack from './BalStack.vue';

describe.only('BalStack', () => {
  describe('When using BalStack', () => {
    it('should render items', () => {
      const { getByText } = render(BalStack, {
        slots: {
          default: '<div>First</div><div>Second</div><div>Third</div>',
        },
      });

      // check that elements are actually rendered as children
      expect(getByText('First')).toBeVisible();
      expect(getByText('Second')).toBeVisible();
      expect(getByText('Third')).toBeVisible();
    });

    it('should render items horizontally when the horizontal prop is supplied', () => {
      const { getByText } = render(BalStack, {
        slots: {
          default: '<div>First</div><div>Second</div><div>Third</div>',
        },
        props: {
          horizontal: true,
        },
      });

      // its fine to make this assumption here as we render the children without any wrappers
      const stackEl = getByText('First').parentElement;
      expect(stackEl).toHaveClass('flex-row');
    });

    it('should render items verticlly if vertical prop is supplied', () => {
      const { getByText } = render(BalStack, {
        slots: {
          default: '<div>First</div><div>Second</div><div>Third</div>',
        },
        props: {
          vertical: true,
        },
      });

      // its fine to make this assumption here as we render the children without any wrappers
      const stackEl = getByText('First').parentElement;
      expect(stackEl).toHaveClass('flex-col');
    });

    it('should render items with space between them', () => {
      const { getByText } = render(BalStack, {
        slots: {
          default: '<div>First</div><div>Second</div><div>Third</div>',
        },
        props: {
          vertical: true,
        },
      });

      // the default spacing unit (tailwind) is 4. So can be either mb-4 or mr-4
      expect(getByText('First')).toHaveClass('mb-4');
      expect(getByText('Second')).toHaveClass('mb-4');
      // last el shouldn't have a spacing class
      expect(getByText('Third')).not.toHaveClass('mb-4');
    });
    it('should render items with a border between them if withBorder prop is supplied', () => {
      const { getByText } = render(BalStack, {
        slots: {
          default: '<div>First</div><div>Second</div><div>Third</div>',
        },
        props: {
          vertical: true,
          withBorder: true,
        },
      });

      // the default spacing unit (tailwind) is 4. So can be either mb-4 or mr-4
      expect(getByText('First')).toHaveClass('mb-4 border-b');
      expect(getByText('Second')).toHaveClass('mb-4 border-b');
      // last el shouldn't have a spacing class
      expect(getByText('Third')).not.toHaveClass('mb-4 border-b');
    });
  });
});
