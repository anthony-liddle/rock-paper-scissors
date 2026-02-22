import { useGameState } from '@engine/gameStore';
import { useGameSystems } from '@hooks/useGameSystems';
import { useBrowserChrome } from '@hooks/useBrowserChrome';
import { useSettings } from '@hooks/useSettings';
import { EffectsLayer } from '@components/EffectsLayer';
import { LandingScreen } from '@components/LandingScreen';
import { AsciiAnimation } from '@components/AsciiAnimation';
import { ScoreBoard } from '@components/ScoreBoard';
import { ChoiceButtons } from '@components/ChoiceButtons';
import { PermissionPrompt } from '@components/PermissionPrompt';
import { DialogueBox } from '@components/DialogueBox';
import { RoundResult } from '@components/RoundResult';
import { EndingScreen } from '@components/EndingScreen';
import { SettingsBar } from '@components/SettingsBar';
import '@styles/index.css';

function App() {
  const { phase, tensionState, endingType, isRebooting } = useGameState();
  const { reducedMotion } = useSettings();
  useBrowserChrome();
  useGameSystems();

  const shutdownClass = isRebooting
    ? endingType === 'BROKEN'
      ? 'crt-shutdown-broken'
      : 'crt-shutdown-escaped'
    : '';

  return (
    <div className={`crt-screen tension-${tensionState.toLowerCase()} ${shutdownClass}${reducedMotion ? ' reduced-motion' : ''}`}>
      <EffectsLayer />

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
