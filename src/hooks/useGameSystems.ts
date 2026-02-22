import { useEffect } from 'react';
import { consoleNarrator } from '@engine/consoleNarrator';
import { devToolsDetector } from '@engine/devToolsDetector';
import { tabLeaveDetector } from '@engine/tabLeaveDetector';
import { illusionEngine } from '@engine/illusionEngine';

export function useGameSystems() {
  useEffect(() => {
    consoleNarrator.start();
    devToolsDetector.start();
    tabLeaveDetector.start();
    illusionEngine.start();
    return () => {
      consoleNarrator.stop();
      devToolsDetector.stop();
      tabLeaveDetector.stop();
      illusionEngine.stop();
    };
  }, []);
}
