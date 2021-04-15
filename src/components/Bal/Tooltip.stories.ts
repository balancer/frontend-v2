import Tooltip from '../Bal/Tooltip.vue';
import { generateTemplate } from '../../../.storybook/helpers/templates';

export default {
  component: Tooltip,
  title: 'Components/Bal/Tooltip',
  parameters: {
    layout: 'centered'
  },
  args: {
    title: 'Tooltip',
    darkMode: false
  }
};

type Props = {
  show?: boolean;
  title?: string;
  noPad?: boolean;
};

const Template = (args: Props) => ({
  components: { Tooltip },
  setup() {
    return { args };
  },
  template: generateTemplate(`
    <Tooltip placement="left">
        This can be any sort of content I want
    </Tooltip>
`)
});

export const DefaultTooltip = Template.bind({});
// @ts-ignore
DefaultTooltip.args = { title: 'Tooltip', show: true };
