// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — animation files are JS template literals
import { pickRandom } from '@utils/random'
import tiltingAnimation from '@data/animations/tilting'
import backandforthAnimation from '@data/animations/backandforth'
import sidetosideAnimation from '@data/animations/sidetoside'
import jiggleAnimation from '@data/animations/jiggle'
import wobbleAnimation from '@data/animations/wobble'
import wibblewobbleAnimation from '@data/animations/wibblewobble'
import forthandbackAnimation from '@data/animations/forthandback'

import shudderAnimation from '@data/animations/shudder'
import shudderbackandforthAnimation from '@data/animations/shudderbackandforth'
import shudderleftleanAnimation from '@data/animations/shudderleftlean'
import shudderrightleanAnimation from '@data/animations/shudderrightlean'
import flailleftleanAnimation from '@data/animations/flailleftlean'
import flailrightleanAnimation from '@data/animations/flailrightlean'

import tiltandquiverAnimation from '@data/animations/tiltandquiver'
import approachAnimation from '@data/animations/approach'
import shakeAnimation from '@data/animations/shake'
import convulseAnimation from '@data/animations/convulse'

import graspAnimation1 from '@data/animations/grasp1'
import graspAnimation2 from '@data/animations/grasp2'
import graspAnimation3 from '@data/animations/grasp3'
import graspAnimation4 from '@data/animations/grasp4'
import graspAnimation5 from '@data/animations/grasp5'
import graspAnimation6 from '@data/animations/grasp6'
import graspAnimation7 from '@data/animations/grasp7'
import graspAnimation8 from '@data/animations/grasp8'

import burstAnimation1 from '@data/animations/burst1'
import burstAnimation2 from '@data/animations/burst2'
import burstAnimation3 from '@data/animations/burst3'

import rockAnimation2 from '@data/animations/rock2'
import paperAnimation2 from '@data/animations/paper2'
import scissorsAnimation3 from '@data/animations/scissors3'

import type { TensionState, Choice } from '@engine/types'

// Full animation registry
export const animations: Record<string, string[]> = {
  tilting: tiltingAnimation,
  backandforth: backandforthAnimation,
  sidetoside: sidetosideAnimation,
  jiggle: jiggleAnimation,
  wobble: wobbleAnimation,
  wibblewobble: wibblewobbleAnimation,
  forthandback: forthandbackAnimation,
  shudder: shudderAnimation,
  shudderbackandforth: shudderbackandforthAnimation,
  shudderleftlean: shudderleftleanAnimation,
  shudderrightlean: shudderrightleanAnimation,
  flailleftlean: flailleftleanAnimation,
  flailrightlean: flailrightleanAnimation,
  tiltandquiver: tiltandquiverAnimation,
  approach: approachAnimation,
  shake: shakeAnimation,
  convulse: convulseAnimation,
  grasp1: graspAnimation1,
  grasp2: graspAnimation2,
  grasp3: graspAnimation3,
  grasp4: graspAnimation4,
  grasp5: graspAnimation5,
  grasp6: graspAnimation6,
  grasp7: graspAnimation7,
  grasp8: graspAnimation8,
  burst1: burstAnimation1,
  burst2: burstAnimation2,
  burst3: burstAnimation3,
  rock2: rockAnimation2,
  paper2: paperAnimation2,
  scissors3: scissorsAnimation3,
}

// Animations mapped to tension states — pick randomly from pool
export const tensionAnimations: Record<TensionState, string[]> = {
  CALM: ['wobble', 'jiggle', 'tilting', 'backandforth', 'sidetoside', 'forthandback', 'wibblewobble'],
  UNEASY: ['shudder', 'shudderbackandforth', 'shudderleftlean', 'shudderrightlean'],
  IRRITATED: ['flailleftlean', 'flailrightlean', 'shake'],
  UNSTABLE: ['tiltandquiver', 'convulse', 'approach'],
  MELTDOWN: ['convulse', 'tiltandquiver'],
}

// Choice reveal animations
const choiceAnimations: Record<Choice, string> = {
  rock: 'rock2',
  paper: 'paper2',
  scissors: 'scissors3',
}

// Grasp sequence for "thinking" animation
const graspAnimations = ['grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8']

// Burst animations for victory moments
const burstAnimations = ['burst1', 'burst2', 'burst3']

export function getAnimationForTension(tension: TensionState): string[] {
  const name = pickRandom(tensionAnimations[tension])
  return animations[name]
}

export function getAnimationByName(name: string): string[] {
  return animations[name] || animations.wobble
}

export function getChoiceAnimation(choice: Choice): string[] {
  return animations[choiceAnimations[choice]]
}

export function getGraspAnimation(): string[] {
  return animations[pickRandom(graspAnimations)]
}

export function getBurstAnimation(): string[] {
  return animations[pickRandom(burstAnimations)]
}

// Frame rate per tension state (ms between frames)
export const tensionFrameRate: Record<TensionState, number> = {
  CALM: 84,
  UNEASY: 70,
  IRRITATED: 56,
  UNSTABLE: 42,
  MELTDOWN: 28,
}
