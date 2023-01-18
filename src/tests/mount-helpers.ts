import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { mount, MountResult } from './mount-composable-tester';
import { registerTestPlugins } from './registerTestPlugins';

export function mountComposable<R>(
  callback: () => R,
  extraProviders?: () => void
): MountResult<R> {
  return mount<R>(callback, {
    provider: () => {
      provideUserSettings();
      provideTokenLists();
      extraProviders?.();
    },
    configApp: app => registerTestPlugins(app),
  });
}
