import { generateTemplate } from '../../../../.storybook/helpers/templates';
import BalAlert from './BalAlert.vue';

export default {
  component: BalAlert,
  title: 'Components/BalAlert',
  parameters: {
    layout: 'centered',
  },
  args: {
    type: 'warning',
    size: 'md',
    title: 'A title message',
    description: 'A description message',
    actionLabel: 'Action',
    raised: false,
  },
  argTypes: {
    type: {
      type: { name: 'string', default: 'button' },
      control: {
        type: 'select',
        options: ['warning', 'error', 'info'],
      },
    },
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
  type?: string;
  size?: string;
  title?: string;
};

const Template = (args: Props) => ({
  components: { BalAlert },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalAlert v-bind="args" />
`),
});

export const Primary = Template.bind({});
// @ts-ignore
// Warning.args = { type: 'warning' };
