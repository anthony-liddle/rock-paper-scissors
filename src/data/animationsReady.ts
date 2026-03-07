import { loadAnimations } from '@data/animationRegistry';

export const animationsReady: Promise<void> = loadAnimations();
