import { useEffect } from 'react';
import { useGameState } from '@engine/gameStore';
import { useVisualEffects } from '@engine/useVisualEffects';
import { useBrowserChrome } from '@engine/useBrowserChrome';
import { useSettings } from '@engine/settings';
import { consoleNarrator } from '@engine/consoleNarrator';
import { devToolsDetector } from '@engine/devToolsDetector';
import { tabLeaveDetector } from '@engine/tabLeaveDetector';
import { illusionEngine } from '@engine/illusionEngine';
import { LandingScreen } from '@components/LandingScreen';
import { AsciiAnimation } from '@components/AsciiAnimation';
import { ScoreBoard } from '@components/ScoreBoard';
import { ChoiceButtons } from '@components/ChoiceButtons';
import { PermissionPrompt } from '@components/PermissionPrompt';
import { DialogueBox } from '@components/DialogueBox';
import { RoundResult } from '@components/RoundResult';
import { EndingScreen } from '@components/EndingScreen';
import { SettingsBar } from '@components/SettingsBar';
import '@styles/crt.css';

function App() {
  const { phase, tensionState, endingType, isRebooting } = useGameState();
  const { flashActive, tearStyle, colorBleedActive, endingRedBleed } = useVisualEffects();
  const { reducedMotion } = useSettings();
  useBrowserChrome();

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

  const shutdownClass = isRebooting
    ? endingType === 'BROKEN'
      ? 'crt-shutdown-broken'
      : 'crt-shutdown-escaped'
    : '';

  return (
    <div className={`crt-screen tension-${tensionState.toLowerCase()} ${shutdownClass}${reducedMotion ? ' reduced-motion' : ''}`}>
      {flashActive && <div className="screen-flash-overlay" />}
      {tearStyle && <div className="screen-tear-overlay" style={tearStyle} />}
      {colorBleedActive && <div className="screen-bleed-overlay" />}
      {endingRedBleed && <div className="ending-red-bleed" />}

      <SettingsBar />

      {phase === 'landing' && <LandingScreen />}

      {phase === 'playing' && (
        <>
          <div className="hud-top">
            <ScoreBoard />
          </div>
          <div className="stage-center">
            <AsciiAnimation />
            <RoundResult />
          </div>
          <div className="hud-bottom">
            <DialogueBox />
            <PermissionPrompt />
            <ChoiceButtons />
          </div>
        </>
      )}

      {phase === 'ending' && (
        <>
          <div className="stage-center">
            <AsciiAnimation />
          </div>
          <div className="hud-bottom">
            <DialogueBox />
            <EndingScreen />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
