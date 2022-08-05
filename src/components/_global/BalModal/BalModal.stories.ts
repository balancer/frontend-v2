import { generateTemplate } from '../../../../.storybook/helpers/templates';
import BalModal from './BalModal.vue';

export default {
  component: BalModal,
  title: 'Components/BalModal',
  args: {
    title: '',
    darkMode: false,
  },
};

type Props = {
  show?: boolean;
  title?: string;
  noPad?: boolean;
};

const Template = (args: Props) => ({
  components: { BalModal },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalModal v-bind="args" @close="args.show = false">
  content
</BalModal>`),
});

export const Primary = Template.bind({});
// @ts-ignore
Primary.args = { title: 'A title', show: true };

export const WithFooter = (args: Props) => ({
  components: { BalModal },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalModal v-bind="args" @close="args.show = false">
  content
  <template v-slot:footer>
    Action
  </template>
</BalModal>`),
});
WithFooter.args = { title: 'A title', show: true };
