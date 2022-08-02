import { render } from '@testing-library/vue';

import BalCard from '@/components/_global/BalCard/BalCard.vue';

import StatCard from './StatCard.vue';

StatCard.components = { BalCard };

describe.only('StatCard', () => {
  describe('When using StatCard', () => {
    it('should render props', () => {
      const { getByText } = render(StatCard, {
        props: {
          label: 'Prop label',
          value: '$10,000',
        },
      });

      // check that elements are actually rendered as children
      expect(getByText('Prop label')).toBeVisible();
      expect(getByText('$10,000')).toBeVisible();
    });

    it('Should render slots', () => {
      const { getByText } = render(StatCard, {
        slots: {
          label: '<span>Slot label</span>',
          value: '<span>$100,000</span>',
        },
      });

      expect(getByText('Slot label')).toBeVisible();
      expect(getByText('$100,000')).toBeVisible();
    });
  });
});
