import { useSyncExternalStore } from 'react';
import { subscribeSettings, getSettings } from '@engine/settings';

export type { Settings } from '@engine/settings';

export function useSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings);
}
