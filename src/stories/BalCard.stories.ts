import '../assets/css/tailwind.css';
import '../assets/css/index.css';

import BalCard from '../components/Bal/Card.vue';

export default {
  component: BalCard,
  title: 'Components/BalCard',
  args: {
    title: 'A title',
    titleTag: 'h3',
    square: false,
    noPad: false,
    shadow: ''
  },
  argTypes: {
    titleTag: { control: { type: 'select', options: ['h1', 'h2', 'h3'] } },
    shadow: {
      control: {
        type: 'select',
        options: ['', 'none', 'sm', 'md', 'lg', 'xl', '2xl']
      }
    }
  }
};

interface Props {
  title: string;
  titleTag: string;
  square: boolean;
  noPad: boolean;
  shadow: string;
}

//👇 We create a “template” of how args map to rendering
const Template = (args: Props) => ({
  components: { BalCard },
  setup() {
    //👇 The args will now be passed down to the template
    return { args };
  },
  template: `
<BalCard v-bind="args">
  Content
  <template v-slot:footer>
    Action
  </template>
</BalCard>
`
});

//👇 Each story then reuses that template
export const Default = Template.bind({});
