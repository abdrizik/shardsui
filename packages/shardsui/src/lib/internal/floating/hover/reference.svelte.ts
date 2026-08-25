import { contains, getTarget } from '$lib/internal/dom'
import { REASONS } from '$lib/internal/reasons'
import { isElement } from '@floating-ui/utils/dom'
import { on } from 'svelte/events'
import { FloatingTreeContext, type FloatingTree } from '../floating-tree.svelte'
import type { HoverContext } from '../types'
import {
  applySafePolygonPointerEventsMutation,
  clearSafePolygonPointerEventsMutation,
  getHoverInteraction,
  type HoverInteraction
} from './interaction.svelte'
import {
  getDelay,
  isClickLikeOpenEvent,
  isInsideEnabledTrigger,
  isMouseLikePointerType,
  type CloseGuard,
  type CloseGuardContextBase,
  type Delay
} from './predicates'

type HoverReferenceInteractionOptions = {
  enabled?: boolean
  closeGuard: CloseGuard | null
  restMs?: number
  delay: Delay
  move: boolean
  mouseOnly?: boolean
  isActiveTrigger: boolean
  triggerElement: Element | null
  tree?: FloatingTree | null | undefined
  inlineCloseGuardContext?: CloseGuardContextBase | null
  shouldAllowOpen?: boolean
  shouldAllowClose?: boolean
  /**
   * Cancels a pending hover-open from the trigger's `mouseout` as well, backing up a `mouseleave`
   * that Chrome can drop during a fast pointer sweep and leave a submenu stuck open.
   */
  guardStaleOpen?: boolean
}

export function hoverReferenceInteraction(
  root: HoverContext,
  options: () => HoverReferenceInteractionOptions
): void {
  const floatingTree = FloatingTreeContext.getOr() ?? null

  const enabled = $derived(options().enabled ?? true)
  const restMs = $derived(options().restMs ?? 0)
  const delay: Delay = $derived(options().delay)
  const move = $derived(options().move)
  const mouseOnly = $derived(options().mouseOnly ?? false)
  const isActiveTrigger = $derived(options().isActiveTrigger)
  const shouldAllowOpen = $derived(options().shouldAllowOpen ?? true)
  const shouldAllowClose = $derived(options().shouldAllowClose ?? true)
  const guardStaleOpen = $derived(options().guardStaleOpen ?? false)

  const closeGuard = $derived(options().closeGuard)
  const referenceElement = $derived(options().triggerElement)
  const tree = $derived(options().tree ?? floatingTree)
  const inlineCloseGuardContext = $derived(options().inlineCloseGuardContext ?? null)

  const instance: HoverInteraction = getHoverInteraction(root.data)

  function hasClickLikeOpenEvent(): boolean {
    return isClickLikeOpenEvent(root.data.openEvent?.type, instance.interactedInside)
  }

  function isOverInactiveTrigger(
    currentDomReference: Element | null,
    currentTarget: Element,
    target: EventTarget | null
  ): boolean {
    const allTriggers = root.triggerElements
    if (allTriggers.hasElement(currentTarget)) {
      return !currentDomReference || !contains(currentDomReference, currentTarget)
    }
    if (!isElement(target)) {
      return false
    }
    const targetElement = target
    return (
      allTriggers.containsNode(targetElement) &&
      (!currentDomReference || !contains(currentDomReference, targetElement))
    )
  }

  $effect(() => () => {
    instance.stopTrackingMouseMove()
  })

  $effect(() => {
    if (!enabled) return

    if (isActiveTrigger) {
      instance.closeGuardOptions = closeGuard?.options
    }

    const trigger = referenceElement as HTMLElement | null

    if (!isElement(trigger)) return

    const openOnHover = (event: MouseEvent): void => {
      instance.openChangeTimeout.clear()
      instance.blockMouseMove = false

      if (mouseOnly && !isMouseLikePointerType(instance.pointerType)) {
        return
      }

      const openDelay = getDelay(delay, 'open', instance.pointerType)
      const eventTarget = getTarget(event)
      const currentDomReference = root.domReferenceElement
      let triggerNode: HTMLElement = trigger

      if (isElement(eventTarget) && !root.triggerElements.hasElement(eventTarget)) {
        for (const triggerElement of root.triggerElements.elements()) {
          if (contains(triggerElement, eventTarget)) {
            triggerNode = triggerElement as HTMLElement
            break
          }
        }
      }

      if (
        isElement(currentDomReference) &&
        !root.triggerElements.hasElement(trigger) &&
        contains(trigger, currentDomReference)
      ) {
        triggerNode = currentDomReference as HTMLElement
      }

      const isOverInactive = isOverInactiveTrigger(currentDomReference, triggerNode, eventTarget)
      const isOpen = root.open
      const isInClosingTransition = root.transitionStatus === 'ending'
      const isHoverCloseTransition = !isOpen && isInClosingTransition && instance.isHoverCloseActive
      const isReenteringSameTriggerDuringCloseTransition =
        !isOverInactive &&
        isElement(currentDomReference) &&
        contains(currentDomReference, triggerNode) &&
        isHoverCloseTransition
      const isRestOnlyDelay = restMs > 0 && !openDelay
      const shouldOpenImmediately =
        (isOverInactive && (isOpen || isHoverCloseTransition)) ||
        isReenteringSameTriggerDuringCloseTransition
      const shouldOpen = !isOpen || isOverInactive

      if (shouldOpenImmediately) {
        if (shouldAllowOpen) {
          root.setOpen(true, REASONS.triggerHover, event, triggerNode)
        }
        return
      }

      if (isRestOnlyDelay) {
        return
      }

      if (openDelay) {
        instance.openChangeTimeout.start(openDelay, () => {
          if (shouldOpen && shouldAllowOpen) {
            root.setOpen(true, REASONS.triggerHover, event, triggerNode)
          }
        })
      } else if (shouldOpen && shouldAllowOpen) {
        root.setOpen(true, REASONS.triggerHover, event, triggerNode)
      }
    }

    const onmouseleave = (event: MouseEvent): void => {
      if (hasClickLikeOpenEvent()) {
        clearSafePolygonPointerEventsMutation(instance)
        return
      }

      instance.stopTrackingMouseMove()
      instance.restTimeout.clear()
      instance.restTimeoutPending = false

      if (isInsideEnabledTrigger(event.relatedTarget, root.triggerElements)) {
        return
      }

      const closeFn = closeGuard
      const closeContext = root.data.closeGuardContext ?? inlineCloseGuardContext
      if (closeFn && closeContext) {
        if (!root.open) {
          instance.openChangeTimeout.clear()
        }

        const currentTrigger = referenceElement

        const trackCursor = closeFn({
          ...closeContext,
          tree,
          x: event.clientX,
          y: event.clientY,
          onClose: () => {
            clearSafePolygonPointerEventsMutation(instance)
            instance.stopTrackingMouseMove()
            if (
              shouldAllowClose &&
              enabled &&
              !hasClickLikeOpenEvent() &&
              currentTrigger === root.domReferenceElement
            ) {
              instance.closeAfterDelay(root, tree, delay, event)
            }
          }
        })

        instance.trackMouseMove(root.domReferenceElement?.ownerDocument ?? document, trackCursor)
        trackCursor(event)
        return
      }

      const shouldClose =
        instance.pointerType === 'touch'
          ? !contains(root.floatingElement, event.relatedTarget)
          : true

      if (shouldClose && shouldAllowClose) {
        instance.closeAfterDelay(root, tree, delay, event)
      }
    }

    const onMouseOut = (event: MouseEvent): void => {
      if (contains(trigger, event.relatedTarget)) {
        return
      }
      instance.openChangeTimeout.clear()
      instance.restTimeout.clear()
      instance.restTimeoutPending = false
    }

    const setPointerType = (event: PointerEvent): void => {
      instance.pointerType = event.pointerType
    }

    const onmousemove = (event: MouseEvent): void => {
      const currentDomReference = root.domReferenceElement
      const currentOpen = root.open
      const isOverInactive = isOverInactiveTrigger(currentDomReference, trigger, event.target)

      if (mouseOnly && !isMouseLikePointerType(instance.pointerType)) {
        return
      }

      if (currentOpen && isOverInactive && instance.closeGuardOptions?.().blockPointerEvents) {
        const floatingElement = root.floatingElement
        if (floatingElement) {
          const scopeElement =
            instance.closeGuardOptions?.().getScope?.() ?? trigger.ownerDocument.body
          applySafePolygonPointerEventsMutation(instance, {
            scopeElement,
            referenceElement: trigger,
            floatingElement
          })
        }
      }

      if ((currentOpen && !isOverInactive) || restMs === 0) {
        return
      }

      if (
        !isOverInactive &&
        instance.restTimeoutPending &&
        event.movementX ** 2 + event.movementY ** 2 < 2
      ) {
        return
      }

      instance.restTimeout.clear()

      const openAfterRest = (): void => {
        instance.restTimeoutPending = false
        if (hasClickLikeOpenEvent()) {
          return
        }
        const latestOpen = root.open
        if (!instance.blockMouseMove && (!latestOpen || isOverInactive) && shouldAllowOpen) {
          root.setOpen(true, REASONS.triggerHover, event, trigger)
        }
      }

      if (instance.pointerType === 'touch' || (isOverInactive && currentOpen)) {
        openAfterRest()
      } else {
        instance.restTimeoutPending = true
        instance.restTimeout.start(restMs, openAfterRest)
      }
    }

    // Registration order is listener order: the `move` handler must clear `blockMouseMove`
    // before `onmousemove` reads it on the same event.
    const cleanups: Array<() => void> = []
    if (move) {
      cleanups.push(on(trigger, 'mousemove', openOnHover, { once: true }))
    }
    cleanups.push(on(trigger, 'mouseenter', openOnHover), on(trigger, 'mouseleave', onmouseleave))
    if (guardStaleOpen) {
      cleanups.push(on(trigger, 'mouseout', onMouseOut))
    }
    cleanups.push(
      on(trigger, 'mousemove', onmousemove),
      on(trigger, 'pointerdown', setPointerType),
      on(trigger, 'pointerenter', setPointerType)
    )

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  })
}
