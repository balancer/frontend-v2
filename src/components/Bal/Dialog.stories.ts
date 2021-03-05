import BalDialog from './Dialog.vue';

export default {
  component: BalDialog,
  title: 'Components/Bal/Dialog',
  args: {
    title: ''
  },
};

type Props = {
  show?: boolean;
};

const Template = (args: Props) => ({
  components: { BalDialog },
  setup() {
    return { args };
  },
  template: `
<BalDialog v-bind="args" @close="args.show = false">
  content
</BalDialog>`
});

export const Primary = Template.bind({});
Primary.args = { title: 'A title', show: true };

export const WithFooter = (args: Props) => ({
  components: { BalDialog },
  setup() {
    return { args };
  },
  template: `
<BalDialog v-bind="args" @close="args.show = false">
  content
  <template v-slot:footer>
    Action
  </template>
</BalDialog>`
});
WithFooter.args = { title: 'A title', show: true };
