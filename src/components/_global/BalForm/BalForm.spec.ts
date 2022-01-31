import { render } from '@testing-library/vue';

import BalForm from './BalForm.vue';
import useForm from './useForm';

const renderComposable = (cb: () => any) => {
  return render({
    setup() {
      return cb();
    },
    render() {
      return '';
    }
  });
};

describe('<BalForm />', () => {
  describe('When using <BalForm />', () => {
    let form;

    beforeEach(() => {
      renderComposable(() => {
        form = useForm({ name: 'testing-form' });
      });
    });
    it('should render children of <BalForm />', () => {
      // const form = useForm({ name: 'test-form' });

      const { getByText, getByPlaceholderText } = render(BalForm, {
        slots: {
          default:
            '<div><span>Test Title</span><input placeholder="test-input" /></div>'
        },
        props: {
          form,
          submit: jest.fn()
        }
      });

      // check that elements are actually rendered as children
      expect(getByText('Test Title')).toBeVisible();
      expect(getByPlaceholderText('test-input')).toBeVisible();
    });
  });
});
