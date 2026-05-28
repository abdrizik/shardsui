import type { Side } from '@floating-ui/utils'
import { isElement } from '@floating-ui/utils/dom'
import { contains } from '../../dom'
import type { PopupTriggerMap } from '../../popup-trigger-map'
import type { FloatingTree } from '../floating-tree.svelte'
import { TYPEABLE_SELECTOR } from '../tabbable'

export function isInsideEnabledTrigger(
  target: EventTarget | null,
  triggerElements: PopupTriggerMap
): boolean {
  if (!isElement(target)) {
    return false
  }
  if (triggerElements.hasElement(target)) {
    return !target.hasAttribute('data-trigger-disabled')
  }
  for (const trigger of triggerElements.elements()) {
    if (contains(trigger, target)) {
      return !trigger.hasAttribute('data-trigger-disabled')
    }
  }
  return false
}

export function isMouseLikePointerType(pointerType: string | undefined): boolean {
  return (
    pointerType === 'mouse' ||
    pointerType === 'pen' ||
    pointerType === '' ||
    pointerType === undefined
  )
}

export function isInteractiveElement(element: Element | null): boolean {
  return (
    element?.closest(
      `button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${TYPEABLE_SELECTOR}`
    ) != null
  )
}

export type CloseGuardOptions = {
  blockPointerEvents?: boolean | undefined
  getScope?: (() => HTMLElement | SVGSVGElement | null) | undefined
}

type CloseGuardContext = {
  x: number
  y: number
  side: Side
  elements: { domReference: Element | null; floating: HTMLElement | null }
  onClose: () => void
  nodeId?: string | undefined
  tree?: FloatingTree | null | undefined
}

export type CloseGuardContextBase = Omit<CloseGuardContext, 'onClose' | 'tree' | 'x' | 'y'>

export type CloseGuard = {
  (context: CloseGuardContext): (event: MouseEvent) => void
  options?: (() => CloseGuardOptions) | undefined
}

export type Delay = number | Partial<{ open: number; close: number }>

export function getDelay(
  value: Delay | undefined,
  prop: 'open' | 'close',
  pointerType?: string
): number | undefined {
  if (pointerType != null && !isMouseLikePointerType(pointerType)) {
    return 0
  }

  return typeof value === 'number' ? value : value?.[prop]
}

export function isClickLikeOpenEvent(
  openEventType: string | undefined,
  interactedInside: boolean
): boolean {
  return interactedInside || openEventType === 'click' || openEventType === 'mousedown'
}

export function isHoverOpenEvent(openEventType: string | undefined): boolean {
  return !!openEventType?.includes('mouse') && openEventType !== 'mousedown'
}
