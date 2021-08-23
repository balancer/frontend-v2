import BalTextInput2 from './BalTextInput2.vue';
import { generateTemplate } from '../../../../.storybook/helpers/templates';

export default {
  component: BalTextInput2,
  title: 'Components/inputs/BalTextInput2',
  args: {
    darkMode: false
  },
  argTypes: {}
};

type Props = {};

const Template = (args: Props) => ({
  components: { BalTextInput2 },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<div class="max-w-lg mx-auto">
  <BalTextInput2 v-model="args.modelValue" v-bind="args"></BalTextInput2>
</div>
`)
});

export const Default = Template.bind({});
// @ts-ignore
Default.args = { modelValue: 'A value' };
