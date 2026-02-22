import { useEffect } from 'react';
import { useSettings } from '@hooks/useSettings';
import { toggleMusicMute, toggleReducedMotion } from '@engine/settings';

export function SettingsBar() {
  const { isMusicMuted, reducedMotion } = useSettings();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'm' || e.key === 'M') {
        toggleMusicMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleReducedMotion();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="settings-bar">
      <button
        className={`settings-btn${isMusicMuted ? ' settings-btn-off' : ''}`}
        onClick={toggleMusicMute}
        title={isMusicMuted ? 'Unmute sound (M)' : 'Mute sound (M)'}
        aria-label={isMusicMuted ? 'Unmute sound' : 'Mute sound'}
      >
        [SND]
      </button>
      <button
        className={`settings-btn${reducedMotion ? ' settings-btn-off' : ''}`}
        onClick={toggleReducedMotion}
        title={reducedMotion ? 'Enable effects (F)' : 'Disable effects (F)'}
        aria-label={reducedMotion ? 'Enable visual effects' : 'Disable visual effects'}
      >
        [FX]
      </button>
    </div>
  );
}
