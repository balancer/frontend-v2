import { getUserSettingsProvision } from '@/providers/user-settings.provider';

export default function useUserSettings() {
  return getUserSettingsProvision();
}
