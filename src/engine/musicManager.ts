import { AudioEngine, createNote, createTrack } from 'soundscape-engine';
import type { Track, Note, SoundscapeState, MixerState, InstrumentPreset } from 'soundscape-engine';
import type { TensionState } from '@engine/types';
import soundscapeData from '@data/soundscape.json';

// BPM per tension level
const TENSION_BPM: Record<TensionState, number> = {
  CALM: 60,
  UNEASY: 78,
  IRRITATED: 100,
  UNSTABLE: 125,
  MELTDOWN: 150,
};

// Which tracks are audible at each tension level
// Layer names derived from JSON track IDs by stripping "track-" prefix
const TENSION_LAYERS: Record<TensionState, string[]> = {
  CALM: ['pad'],
  UNEASY: ['pad', 'bass'],
  IRRITATED: ['pad', 'bass', 'keys', 'percussion'],
  UNSTABLE: ['pad', 'bass', 'keys', 'percussion', 'lead'],
  MELTDOWN: ['pad', 'bass', 'keys', 'percussion', 'lead', 'glitch', 'glitch-random'],
};

const LOOP_LENGTH = 16; // beats

// --- Random glitch track — different every session ---

function buildRandomGlitchTrack(): Track {
  const track = createTrack('Random Glitch', 'pluck');
  const notes: Note[] = [];

  // Layer 1: rapid-fire random stabs across full pitch range
  for (let i = 0; i < LOOP_LENGTH * 4; i++) {
    const time = i * 0.25;
    if (time >= LOOP_LENGTH) break;
    const pitch = 20 + Math.floor(Math.random() * 80);
    notes.push(createNote(pitch, time, 0.05 + Math.random() * 0.1, 60 + Math.floor(Math.random() * 67)));
  }

  // Layer 2: sustained dissonant cluster tones (tritones, minor 2nds)
  const clusterPitches = [41, 42, 47, 53, 54, 59, 65, 66, 71, 77, 78];
  for (let i = 0; i < 6; i++) {
    const time = Math.random() * (LOOP_LENGTH - 1);
    const pitch = clusterPitches[Math.floor(Math.random() * clusterPitches.length)];
    notes.push(createNote(pitch, time, 0.5 + Math.random() * 1.5, 80 + Math.floor(Math.random() * 47)));
  }

  // Layer 3: low rumble hits
  for (let i = 0; i < LOOP_LENGTH; i += 2) {
    notes.push(createNote(24 + Math.floor(Math.random() * 8), i, 0.3, 110 + Math.floor(Math.random() * 17)));
  }

  track.notes = notes;
  track.paramOverrides = {
    distortion: 0.7,
    filterCutoff: 0.9,
    filterResonance: 0.6,
    attack: 0.001,
    decay: 0.1,
    sustain: 0.03,
    release: 0.05,
  };
  return track;
}

// --- Track registry (by name for mute/unmute) ---

interface TrackEntry {
  track: Track;
  name: string; // lookup key used in TENSION_LAYERS
}

// Derive layer name from JSON track ID: "track-pad" -> "pad"
function layerNameFromId(trackId: string): string {
  return trackId.replace(/^track-/, '');
}

// --- Music Manager ---

class GameMusicManager {
  private engine: AudioEngine;
  private trackEntries: TrackEntry[] = [];
  private initialized = false;
  private currentTension: TensionState = 'CALM';
  private muted = false;

  constructor() {
    this.engine = new AudioEngine();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.engine.initialize();

    // Load composed tracks from JSON
    const jsonTracks: Track[] = soundscapeData.tracks as Track[];
    this.trackEntries = jsonTracks.map((track) => ({
      track,
      name: layerNameFromId(track.id),
    }));

    // Add runtime-generated random glitch track
    const randomGlitch = buildRandomGlitchTrack();
    this.trackEntries.push({ track: randomGlitch, name: 'glitch-random' });

    const allTracks = this.trackEntries.map((e) => e.track);
    const presets = soundscapeData.presets as InstrumentPreset[];
    const mixer = this.buildMixer('CALM');

    const state: SoundscapeState = {
      metadata: {
        name: soundscapeData.metadata.name,
        tempo: TENSION_BPM.CALM,
        timeSignature: soundscapeData.metadata.timeSignature as [number, number],
        lengthBeats: soundscapeData.metadata.lengthBeats,
      },
      tracks: allTracks,
      presets,
      mixer,
    };

    this.engine.updateState(state);
    this.engine.setLoop(true);
    this.initialized = true;
  }

  private buildMixer(tension: TensionState): MixerState {
    const activeLayers = TENSION_LAYERS[tension];
    const tracks: MixerState['tracks'] = {};

    for (const entry of this.trackEntries) {
      const isActive = activeLayers.includes(entry.name);
      tracks[entry.track.id] = {
        volume: this.getTrackVolume(entry.name, tension),
        mute: !isActive,
        solo: false,
      };
    }

    return {
      tracks,
      masterVolume: 0.7,
    };
  }

  private getTrackVolume(trackName: string, tension: TensionState): number {
    const volumes: Record<string, Partial<Record<TensionState, number>>> = {
      pad: { CALM: 0.7, UNEASY: 0.55, IRRITATED: 0.45, UNSTABLE: 0.35, MELTDOWN: 0.25 },
      bass: { UNEASY: 0.55, IRRITATED: 0.65, UNSTABLE: 0.75, MELTDOWN: 0.85 },
      keys: { IRRITATED: 0.45, UNSTABLE: 0.5, MELTDOWN: 0.55 },
      percussion: { IRRITATED: 0.5, UNSTABLE: 0.65, MELTDOWN: 0.85 },
      lead: { UNSTABLE: 0.5, MELTDOWN: 0.7 },
      glitch: { MELTDOWN: 0.6 },
      'glitch-random': { MELTDOWN: 0.5 },
    };
    return volumes[trackName]?.[tension] ?? 0.5;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.initialized) return;
    const mixer = this.buildMixer(this.currentTension);
    mixer.masterVolume = muted ? 0 : 0.7;
    this.engine.updateMixer(mixer);
  }

  async start(): Promise<void> {
    if (!this.initialized) await this.initialize();
    if (this.muted) {
      const mixer = this.buildMixer(this.currentTension);
      mixer.masterVolume = 0;
      this.engine.updateMixer(mixer);
    }
    await this.engine.resume();
    this.engine.play();
  }

  stop(): void {
    this.engine.stop();
  }

  setTension(tension: TensionState): void {
    if (tension === this.currentTension) return;
    this.currentTension = tension;

    // Update BPM
    this.engine.setTempo(TENSION_BPM[tension]);

    // Update which layers are active
    const mixer = this.buildMixer(tension);
    if (this.muted) mixer.masterVolume = 0;
    this.engine.updateMixer(mixer);
  }

  // --- Sound Effects ---

  playSfx(type: 'win' | 'lose' | 'tie' | 'click' | 'permission' | 'disruption' | 'ending-broken' | 'ending-escaped'): void {
    if (!this.initialized || this.muted) return;

    switch (type) {
      case 'win':
        this.engine.previewNote(72, 100, 'keys');
        break;
      case 'lose':
        this.engine.previewNote(40, 90, 'bass', { distortion: 0.3 });
        break;
      case 'tie':
        this.engine.previewNote(60, 70, 'pluck');
        break;
      case 'click':
        this.engine.previewNote(80, 50, 'pluck', {
          attack: 0.001,
          decay: 0.05,
          sustain: 0,
          release: 0.02,
        });
        break;
      case 'permission':
        this.engine.previewNote(55, 100, 'lead', {
          delayMix: 0.4,
          delayFeedback: 0.5,
          delayTime: 0.3,
        });
        break;
      case 'disruption':
        // Harsh layered burst — low hit + high screech + mid crunch
        this.engine.previewNote(28, 127, 'percussion', {
          distortion: 0.8,
          filterCutoff: 0.9,
          filterResonance: 0.6,
        });
        this.engine.previewNote(90, 110, 'lead', {
          distortion: 0.7,
          filterCutoff: 0.95,
          filterResonance: 0.8,
          attack: 0.001,
          decay: 0.1,
          sustain: 0,
          release: 0.05,
        });
        this.engine.previewNote(50, 100, 'bass', {
          distortion: 0.6,
          filterCutoff: 0.4,
          waveform: 'square',
        });
        break;
      case 'ending-broken':
        // Descending rumble — low notes cascading down
        this.engine.previewNote(48, 100, 'bass', {
          distortion: 0.4,
          filterCutoff: 0.3,
          attack: 0.01,
          decay: 1.5,
          sustain: 0.1,
          release: 1.0,
        });
        this.engine.previewNote(36, 110, 'percussion', {
          distortion: 0.5,
          filterCutoff: 0.2,
          attack: 0.1,
          decay: 2.0,
          sustain: 0.05,
          release: 1.5,
        });
        this.engine.previewNote(24, 90, 'bass', {
          filterCutoff: 0.15,
          attack: 0.3,
          decay: 2.5,
          sustain: 0,
          release: 2.0,
        });
        break;
      case 'ending-escaped':
        // Ascending ominous tone — rising pitch with distortion
        this.engine.previewNote(40, 90, 'lead', {
          distortion: 0.6,
          filterCutoff: 0.7,
          filterResonance: 0.5,
          attack: 0.01,
          decay: 2.0,
          sustain: 0.3,
          release: 1.5,
          delayMix: 0.3,
          delayFeedback: 0.4,
          delayTime: 0.25,
        });
        this.engine.previewNote(55, 100, 'lead', {
          distortion: 0.5,
          filterCutoff: 0.8,
          attack: 0.2,
          decay: 2.5,
          sustain: 0.2,
          release: 2.0,
        });
        this.engine.previewNote(67, 80, 'pluck', {
          distortion: 0.3,
          filterCutoff: 0.9,
          attack: 0.5,
          decay: 3.0,
          sustain: 0.1,
          release: 2.5,
        });
        break;
    }
  }

  destroy(): void {
    this.engine.destroy();
    this.initialized = false;
  }
}

// Singleton instance
export const musicManager = new GameMusicManager();
