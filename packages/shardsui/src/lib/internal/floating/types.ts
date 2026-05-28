import type { PopupTriggerMap } from '../popup-trigger-map'
import type { TransitionStatus } from '../transition-status.svelte'
import type { HoverInteraction } from './hover/interaction.svelte'
import type { CloseGuardContextBase } from './hover/predicates'

export type FloatingContextData = {
  openEvent?: Event | undefined
  hoverInteraction?: HoverInteraction | undefined
  closeGuardContext?: CloseGuardContextBase | undefined
}

export type HoverContext = {
  data: FloatingContextData
  triggerElements: PopupTriggerMap
  open: boolean
  transitionStatus: TransitionStatus
  domReferenceElement: Element | null
  floatingElement: HTMLElement | null
  setOpen(open: boolean, reason?: string, event?: Event, trigger?: HTMLElement | null): void
}
