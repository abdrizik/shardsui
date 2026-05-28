import type { TransitionStatus } from './transition-status.svelte'

export function getDisabledMountTransitionStyles(transitionStatus: TransitionStatus): string {
  return transitionStatus === 'starting' ? 'transition:none;' : ''
}
