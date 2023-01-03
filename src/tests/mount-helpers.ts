import {
  userSettingsProvider,
  UserSettingsProviderSymbol,
} from '@/providers/user-settings.provider';
import { provide } from 'vue';
import { mount, MountResult } from 'vue-composable-tester';
import { useQueryProvider } from 'vue-query';

export function mountComposable<R>(callback: () => R): MountResult<R> {
  return mount<R>(callback, {
    provider: () => {
      useQueryProvider();
      provide(UserSettingsProviderSymbol, userSettingsProvider());
    },
  });
}
