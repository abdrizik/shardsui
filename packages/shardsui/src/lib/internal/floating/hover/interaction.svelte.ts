import { REASONS } from '$lib/internal/reasons'
import { on } from 'svelte/events'
import { Timeout } from '../../timeout'
import type { FloatingTree } from '../floating-tree.svelte'
import type { FloatingContextData, HoverContext } from '../types'
import { getDelay, type CloseGuardOptions, type Delay } from './predicates'

export class HoverInteraction {
  pointerType: string | undefined
  interactedInside = false
  blockMouseMove = true
  restTimeoutPending = false
  isHoverCloseActive = false
  closeGuardOptions: (() => CloseGuardOptions) | undefined

  performedPointerEventsMutation = false
  pointerEventsScopeElement: HTMLElement | SVGSVGElement | null = null
  pointerEventsReferenceElement: HTMLElement | SVGSVGElement | null = null
  pointerEventsFloatingElement: HTMLElement | null = null

  mouseMoveHandler: ((event: MouseEvent) => void) | undefined
  #offMouseMove: (() => void) | undefined

  subscribers = 0
  openChangeTimeout = new Timeout()
  restTimeout = new Timeout()

  trackMouseMove(doc: Document, handler: (event: MouseEvent) => void): void {
    this.stopTrackingMouseMove()
    this.mouseMoveHandler = handler
    this.#offMouseMove = on(doc, 'mousemove', handler)
  }

  stopTrackingMouseMove(): void {
    if (!this.mouseMoveHandler) return
    this.#offMouseMove?.()
    this.#offMouseMove = undefined
    this.mouseMoveHandler = undefined
  }

  closeAfterDelay(
    root: HoverContext,
    tree: FloatingTree | null,
    delay: Delay,
    event: MouseEvent
  ): void {
    const closeDelay = getDelay(delay, 'close', this.pointerType)
    const close = () => {
      root.setOpen(false, REASONS.triggerHover, event)
      tree?.events.emit('floating.closed', event)
    }
    if (closeDelay) {
      this.openChangeTimeout.start(closeDelay, close)
    } else {
      this.openChangeTimeout.clear()
      close()
    }
  }

  onOpenChange = (change: { open: boolean; reason?: string }): void => {
    if (change.open) {
      this.isHoverCloseActive = false
      return
    }
    this.isHoverCloseActive = change.reason === REASONS.triggerHover
    this.stopTrackingMouseMove()
    this.openChangeTimeout.clear()
    this.restTimeout.clear()
    this.blockMouseMove = true
    this.restTimeoutPending = false
  }

  dispose = (): void => {
    this.openChangeTimeout.clear()
    this.restTimeout.clear()
  }
}

/**
 * Returns the `HoverInteraction` shared by every consumer of a holder, disposed once the last
 * of them unmounts.
 */
export function getHoverInteraction(holder: {
  hoverInteraction?: HoverInteraction | undefined
}): HoverInteraction {
  const instance = (holder.hoverInteraction ??= new HoverInteraction())
  instance.subscribers += 1

  $effect(() => () => {
    instance.subscribers -= 1
    if (instance.subscribers > 0) return

    instance.dispose()
    if (holder.hoverInteraction === instance) {
      holder.hoverInteraction = undefined
    }
  })

  return instance
}

const ownerByScopeElement = new WeakMap<HTMLElement | SVGSVGElement, HoverInteraction>()

export function clearSafePolygonPointerEventsMutation(instance: HoverInteraction): void {
  if (!instance.performedPointerEventsMutation) {
    return
  }

  const scopeElement = instance.pointerEventsScopeElement

  if (scopeElement && ownerByScopeElement.get(scopeElement) === instance) {
    scopeElement.style.removeProperty('pointer-events')
    instance.pointerEventsReferenceElement?.style.removeProperty('pointer-events')
    instance.pointerEventsFloatingElement?.style.removeProperty('pointer-events')
    ownerByScopeElement.delete(scopeElement)
  }

  instance.performedPointerEventsMutation = false
  instance.pointerEventsScopeElement = null
  instance.pointerEventsReferenceElement = null
  instance.pointerEventsFloatingElement = null
}

export function applySafePolygonPointerEventsMutation(
  instance: HoverInteraction,
  options: {
    scopeElement: HTMLElement | SVGSVGElement
    referenceElement: HTMLElement | SVGSVGElement
    floatingElement: HTMLElement
  }
): void {
  const { scopeElement, referenceElement, floatingElement } = options

  const existingOwner = ownerByScopeElement.get(scopeElement)
  if (existingOwner && existingOwner !== instance) {
    clearSafePolygonPointerEventsMutation(existingOwner)
  }

  clearSafePolygonPointerEventsMutation(instance)
  instance.performedPointerEventsMutation = true
  instance.pointerEventsScopeElement = scopeElement
  instance.pointerEventsReferenceElement = referenceElement
  instance.pointerEventsFloatingElement = floatingElement
  ownerByScopeElement.set(scopeElement, instance)

  scopeElement.style.pointerEvents = 'none'
  referenceElement.style.pointerEvents = 'auto'
  floatingElement.style.pointerEvents = 'auto'
}

export function dispatchOpenChange(
  data: FloatingContextData,
  open: boolean,
  reason?: string
): void {
  data.hoverInteraction?.onOpenChange({
    open,
    reason: reason ?? REASONS.none
  })
}
