import BalDialog from './Dialog.vue';
import { generateTemplate } from '../../../.storybook/helpers/templates';

export default {
  component: BalDialog,
  title: 'Components/Bal/Dialog',
  args: {
    title: '',
    darkMode: false
  }
};

type Props = {
  show?: boolean;
  title?: string;
  noPad?: boolean;
};

const Template = (args: Props) => ({
  components: { BalDialog },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalDialog v-bind="args" @close="args.show = false">
  content
</BalDialog>`)
});

export const Primary = Template.bind({});
// @ts-ignore
Primary.args = { title: 'A title', show: true };

export const WithFooter = (args: Props) => ({
  components: { BalDialog },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalDialog v-bind="args" @close="args.show = false">
  content
  <template v-slot:footer>
    Action
  </template>
</BalDialog>`)
});
WithFooter.args = { title: 'A title', show: true };
