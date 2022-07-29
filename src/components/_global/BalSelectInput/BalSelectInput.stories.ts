import { Rules } from '@/types';

import { generateTemplate } from '../../../../.storybook/helpers/templates';
import BalSelectInput from './BalSelectInput.vue';

export default {
  component: BalSelectInput,
  title: 'Components/inputs/BalSelectInput',
  args: {
    darkMode: false,
    name: 'input1',
    label: 'Withdrawal type',
    size: 'md',
  },
  argTypes: {
    size: {
      type: { name: 'string', default: 'md' },
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg'],
      },
    },
  },
};

type Props = {
  name: string;
  label: string;
  size: string;
  rules: Array<Rules>;
};

const Template = (args: Props) => ({
  components: { BalSelectInput },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalSelectInput
  v-model="args.modelValue"
  v-bind="args"
/>
`),
});

export const Default = Template.bind({});
// @ts-ignore
Default.args = {
  modelValue: 'Proportional',
  options: ['Proportional', 'Custom'],
};
