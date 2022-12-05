import { ref } from 'vue';
import i18n from '@/plugins/i18n';

export enum Tab {
  PoolTokens,
  SingleToken,
}

export const tabs = [
  { value: Tab.PoolTokens, label: i18n.global.t('withdraw.tabs.poolTokens') },
  {
    value: Tab.SingleToken,
    label: i18n.global.t('withdraw.tabs.singleToken'),
  },
];

const activeTab = ref(tabs[0].value);

function resetTabs() {
  activeTab.value = tabs[0].value;
}

export default function useWithdrawPageTabs() {
  return { activeTab, resetTabs };
}
