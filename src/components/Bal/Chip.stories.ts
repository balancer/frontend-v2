import BalChip from './Chip.vue';
import { generateTemplate } from '../../../.storybook/helpers/templates';

export default {
  component: BalChip,
  title: 'Components/Bal/Chip',
  parameters: {
    layout: 'centered',
    actions: { handles: ['click .close'] }
  },
  args: {
    darkMode: false,
    label: 'tag',
    closeable: true,
    size: 'md',
    color: 'gray'
  },
  argTypes: {
    size: {
      type: { name: 'string', default: 'md' },
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg']
      }
    },
    color: {
      type: { name: 'string', default: 'text' },
      control: {
        type: 'select',
        options: ['gray', 'gradient']
      }
    }
  }
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
`)
});

export const Default = Template.bind({});
