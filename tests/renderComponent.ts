import { RenderOptions, render } from '@testing-library/vue';
import { registerTestPlugins } from './registerTestPlugins';
import { mergeWith } from 'lodash';
import { RouterLinkStub } from '@vue/test-utils';

const DefaultTestPlugins = {
  install(app) {
    registerTestPlugins(app);
  },
};

export function renderComponent(
  componentUnderTest,
  options: RenderOptions = {}
) {
  const defaultOptions = {
    global: {
      plugins: [DefaultTestPlugins],
      stubs: {
        RouterLink: RouterLinkStub,
        Jazzicon: true,
        BalIcon: true,
        LightBulbIcon: true,
      },
    },
  };

  const mergedOptions = mergeWith(defaultOptions, options, mergeCustomizer);

  return render(componentUnderTest, mergedOptions);
}

function mergeCustomizer(objValue: unknown, srcValue: unknown) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}
