import BalBtn from './Btn.vue';
import { generateTemplate } from '../../../.storybook/helpers/templates';

export default {
  component: BalBtn,
  title: 'Components/Bal/Btn',
  parameters: {
    layout: 'centered',
    actions: { handles: ['click'] }
  },
  args: {
    darkMode: false,
    tag: 'button',
    size: 'md',
    color: 'primary',
    loadingLabel: 'Loading...'
  },
  argTypes: {
    tag: {
      type: { name: 'string', default: 'button' },
      control: {
        type: 'select',
        options: ['button', 'a', 'div']
      }
    },
    size: {
      type: { name: 'string', default: 'md' },
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg']
      }
    },
    color: {
      type: { name: 'string', default: 'primary' },
      control: {
        type: 'select',
        options: ['primary', 'gradient']
      }
    }
  }
};

type Props = {
};

const Template = (args: Props) => ({
  components: { BalBtn },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalBtn v-bind="args">
  Action
</BalBtn>`)
});

export const Primary = Template.bind({});
