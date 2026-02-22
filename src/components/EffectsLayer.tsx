import { useVisualEffects } from '@hooks/useVisualEffects';

export function EffectsLayer() {
  const { flashActive, tearStyle, colorBleedActive, endingRedBleed } = useVisualEffects();

  return (
    <>
      {flashActive && <div className="screen-flash-overlay" />}
      {tearStyle && <div className="screen-tear-overlay" style={tearStyle} />}
      {colorBleedActive && <div className="screen-bleed-overlay" />}
      {endingRedBleed && <div className="ending-red-bleed" />}
    </>
  );
}
