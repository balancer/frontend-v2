import { generateTemplate } from '../../../../.storybook/helpers/templates';
import BalCard from './BalCard.vue';

export default {
  component: BalCard,
  title: 'Components/BalCard',
  args: {
    darkMode: false,
    title: '',
    titleTag: 'h3',
    shadow: '',
  },
  argTypes: {
    titleTag: { control: { type: 'select', options: ['h1', 'h2', 'h3'] } },
    shadow: {
      control: {
        type: 'select',
        options: ['', 'none', 'sm', 'md', 'lg', 'xl', '2xl'],
      },
    },
  },
};

type Props = {
  title?: string;
  titleTag?: string;
  square?: boolean;
  noPad?: boolean;
  shadow?: string;
};

const Template = (args: Props) => ({
  components: { BalCard },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalCard v-bind="args">
  content
</BalCard>`),
});

export const OnlyContent = Template.bind({});

export const WithTitle = Template.bind({});
// @ts-ignore
WithTitle.args = { title: 'A title' };

export const WithFooter = (args: Props) => ({
  components: { BalCard },
  setup() {
    return { args };
  },
  template: generateTemplate(`
<BalCard v-bind="args">
  Content
  <template v-slot:footer>
    Action
  </template>
</BalCard>`),
});

export const Complete = WithFooter.bind({});
// @ts-ignore
Complete.args = { title: 'A title' };
