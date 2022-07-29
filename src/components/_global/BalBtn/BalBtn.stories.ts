import { generateTemplate } from '../../../../.storybook/helpers/templates';
import BalBtn from './BalBtn.vue';

export default {
  component: BalBtn,
  title: 'Components/BalBtn',
  parameters: {
    layout: 'centered',
    actions: { handles: ['click'] },
  },
  args: {
    darkMode: false,
    tag: 'button',
    size: 'md',
    color: 'primary',
    label: '',
    loadingLabel: 'Loading...',
  },
  argTypes: {
    tag: {
      type: { name: 'string', default: 'button' },
      control: {
        type: 'select',
        options: ['button', 'a', 'div'],
      },
    },
    size: {
      type: { name: 'string', default: 'md' },
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg'],
      },
    },
    color: {
      type: { name: 'string', default: 'primary' },
      control: {
        type: 'select',
        options: ['primary', 'gradient', 'gray', 'red'],
      },
    },
  },
};

type Props = {
  tag?: string;
  size?: string;
  color?: string;
  label?: string;
  block?: boolean;
  circle?: boolean;
  outline?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
};

const Template = (args: Props) => ({
  components: { BalBtn },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalBtn v-bind="args">
  Action
</BalBtn>`),
});

export const Primary = Template.bind({});
