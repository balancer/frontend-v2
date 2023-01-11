import { registerTestPlugins } from '@/plugins';
import {
  userSettingsProvider,
  UserSettingsProviderSymbol,
} from '@/providers/user-settings.provider';
import { provide } from 'vue';
import { mount, MountResult } from './mount-composable-tester';

export function mountComposable<R>(callback: () => R): MountResult<R> {
  return mount<R>(callback, {
    provider: () => {
      provide(UserSettingsProviderSymbol, userSettingsProvider());
    },
    configApp: app => registerTestPlugins(app),
  });
}
