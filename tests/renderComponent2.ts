import { defineComponent, h } from 'vue';
import vueQuery from '@/plugins/vueQuery';
import { render, RenderOptions } from '@testing-library/vue';
import Web3Plugin from '@/services/web3/web3.plugin';
import blocknative from '@/plugins/blocknative';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';

interface ProviderComponent {
  component: any;
  props: RenderOptions['props'];
}

interface AdditionalContext {
  providers: ProviderComponent[];
}

const GlobalProvidersComponent = defineComponent({
  setup(props, { slots }) {
    const userSettings = provideUserSettings();
    const tokenLists = provideTokenLists();
    provideTokens(userSettings, tokenLists);
    return () => h('div', {}, slots.default && slots.default());
  },
});

const rootProviders: ProviderComponent[] = [
  { component: GlobalProvidersComponent, props: {} },
];

export default function renderComponent(
  componentUnderTest,
  options: RenderOptions = {},
  additionalContext?: AdditionalContext
) {
  const providers = additionalContext?.providers || [];
  const { props, ...restOptions } = options;
  const allProviders: ProviderComponent[] = [...rootProviders, ...providers];

  // Create Modal teleport target
  const el = document.createElement('div');
  el.id = 'modal';
  el.attributes.setNamedItem(document.createAttribute('teleport-target'));
  document.body.appendChild(el);

  return render(
    renderComponentWithProviders(componentUnderTest, props, allProviders),
    {
      ...getOptions(restOptions),
    }
  );
}

function getOptions(
  options: Omit<RenderOptions, 'props'> = { global: {} }
): RenderOptions {
  return {
    ...options,
    global: {
      plugins: [vueQuery, Web3Plugin, blocknative],
      ...options.global,
    },
  };
}

function renderComponentWithProviders(
  componentUnderTest,
  props: RenderOptions['props'] = {},
  providers: ProviderComponent[]
) {
  function renderProviders(providers: ProviderComponent[]) {
    if (!providers.length) {
      return h(componentUnderTest, props);
    }

    const [provider, ...remainingProviders] = providers;

    return h(provider.component, provider.props, {
      default() {
        return renderProviders(remainingProviders);
      },
    });
  }

  return renderProviders(providers);
}
