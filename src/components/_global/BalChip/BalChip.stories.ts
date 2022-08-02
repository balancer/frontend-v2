import { generateTemplate } from '../../../../.storybook/helpers/templates';
import BalChip from './BalChip.vue';

export default {
  component: BalChip,
  title: 'Components/BalChip',
  parameters: {
    layout: 'centered',
    actions: { handles: ['click .close'] },
  },
  args: {
    darkMode: false,
    label: 'tag',
    closeable: true,
    size: 'md',
    color: 'gray',
  },
  argTypes: {
    size: {
      type: { name: 'string', default: 'md' },
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg'],
      },
    },
    color: {
      type: { name: 'string', default: 'text' },
      control: {
        type: 'select',
        options: ['gray', 'gradient'],
      },
    },
  },
};

type Props = {
  size?: string;
  color?: string;
};

const Template = (args: Props) => ({
  components: { BalChip },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalChip v-bind="args" />
`),
});

export const Default = Template.bind({});
