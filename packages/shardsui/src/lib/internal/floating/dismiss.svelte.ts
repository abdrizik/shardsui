import { isElement, isNode } from '@floating-ui/utils/dom'
import { isWebKit } from '$lib/internal/detect-browser'
import { getTarget } from '$lib/internal/dom'
import { REASONS } from '$lib/internal/reasons'
import { on } from 'svelte/events'
import { contains } from '../dom'
import { getNodeChildren, type FloatingTree } from '../floating/floating-tree.svelte'
import { isInjectedAfterOpen } from '../is-injected-after-open'
import { Timeout } from '../timeout'
import { containsThroughPortals } from './portal'

type PressType = 'intentional' | 'sloppy'

export type DismissReason =
  | typeof REASONS.escapeKey
  | typeof REASONS.outsidePress
  | typeof REASONS.triggerPress

export function normalizeBubbles(
  normalizable?: boolean | { escapeKey?: boolean; outsidePress?: boolean }
) {
  return {
    escapeKey:
      typeof normalizable === 'boolean' ? normalizable : (normalizable?.escapeKey ?? false),
    outsidePress:
      typeof normalizable === 'boolean' ? normalizable : (normalizable?.outsidePress ?? true)
  }
}

type DismissOptions = {
  open: boolean
  onClose: (reason: DismissReason, event: Event) => void
  enabled?: boolean
  escapeKey?: boolean
  outsidePress?: boolean | ((event: MouseEvent | TouchEvent) => boolean)
  outsidePressEvent?: PressType | { mouse: PressType; touch: PressType }
  triggerPress?: boolean
  popupElement: Element | null
  referenceElement?: Element | null
  isInsideElement: (target: Node) => boolean
  bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean } | undefined
  tree?: FloatingTree | undefined
  nodeId?: string | undefined
}

export function dismiss(options: () => DismissOptions): void {
  const open = $derived(options().open)
  const onClose = $derived(options().onClose)
  const enabled = $derived(options().enabled ?? true)
  const escapeKey = $derived(options().escapeKey ?? true)
  const outsidePress = $derived(options().outsidePress ?? true)
  const outsidePressEvent = $derived(options().outsidePressEvent ?? 'sloppy')
  const triggerPress = $derived(options().triggerPress ?? false)
  const popupElement = $derived(options().popupElement)
  const referenceElement = $derived(options().referenceElement ?? null)
  const isInsideElement = $derived(options().isInsideElement)
  const bubbles = $derived(options().bubbles)
  const tree = $derived(options().tree)
  const nodeId = $derived(options().nodeId)

  let isComposing = false
  const compositionTimeout = new Timeout()

  let pressStartTarget: Element | null = null
  let currentPointerType: PointerEvent['pointerType'] = ''

  let insideTree = false
  const clearInsideTreeTimeout = new Timeout()

  let touchState: {
    startTime: number
    startX: number
    startY: number
    dismissOnTouchEnd: boolean
    dismissOnMouseDown: boolean
  } | null = null

  const cancelDismissOnEndTimeout = new Timeout()

  $effect(compositionTimeout.disposeEffect)
  $effect(clearInsideTreeTimeout.disposeEffect)
  $effect(cancelDismissOnEndTimeout.disposeEffect)

  $effect(() => {
    if (!open || !enabled) return

    const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } =
      normalizeBubbles(bubbles)

    const ownNode = tree && nodeId ? tree.nodes.find((n) => n.id === nodeId) : undefined
    if (ownNode) {
      ownNode.dismissBubbles = {
        escapeKey: escapeKeyBubbles,
        outsidePress: outsidePressBubbles
      }
    }

    const pendingTargetCleanups = new Set<() => void>()

    // `on()` from `svelte/events` defers attachment by a microtask for `pointer*`/`touch*`/
    // `wheel`, which would land after this dispatch has already ended.
    function addTargetEventListenerOnce<EventType extends Event>(
      event: EventType,
      listener: (event: EventType) => void
    ) {
      const target = getTarget(event)
      if (!target) return

      const detach = () => {
        target.removeEventListener(event.type, handler)
        pendingTargetCleanups.delete(detach)
      }
      const handler = () => {
        listener(event)
        detach()
      }

      target.addEventListener(event.type, handler)
      pendingTargetCleanups.add(detach)
    }

    function clearInsideTree() {
      clearInsideTreeTimeout.clear()
      insideTree = false
    }

    function markInsideTree() {
      insideTree = true
      clearInsideTreeTimeout.start(0, clearInsideTree)
    }

    // `dismissBubbles` is present exactly while a descendant's own dismiss effect is live, so
    // it survives the rest of a dispatch in which that descendant already set `open = false`.
    function hasBlockingChild(bubbleKey: 'escapeKey' | 'outsidePress'): boolean {
      if (!tree || !nodeId) return false
      const children = getNodeChildren(tree.nodes, nodeId, false)
      return children.some(
        (child) => child.dismissBubbles !== undefined && !child.dismissBubbles[bubbleKey]
      )
    }

    function isWithinOwnElements(target: EventTarget | null): boolean {
      if (!isNode(target)) return false
      return containsThroughPortals(popupElement, target) || isInsideElement(target)
    }

    function isWithinFloatingTree(target: Node | null): boolean {
      if (isWithinOwnElements(target)) return true
      if (!tree || !nodeId) return false
      return getNodeChildren(tree.nodes, nodeId).some((node) => contains(node.floating, target))
    }

    function oncompositionstart() {
      compositionTimeout.clear()
      isComposing = true
    }

    function oncompositionend() {
      // Safari fires `compositionend` before `keydown`.
      // 0ms or 1ms don't work in Safari. 5ms appears to consistently work.
      compositionTimeout.start(isWebKit ? 5 : 0, () => {
        isComposing = false
      })
    }

    function onkeydown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return

      // `Escape` while composing should close the IME compose menu, not the floating element.
      if (isComposing) return

      if (!escapeKeyBubbles && hasBlockingChild('escapeKey')) {
        return
      }

      onClose(REASONS.escapeKey, e)

      e.preventDefault()

      if (!escapeKeyBubbles) {
        e.stopPropagation()
      }
    }

    function getOutsidePressEventType(): PressType {
      if (typeof outsidePressEvent === 'string') {
        return outsidePressEvent
      }
      return outsidePressEvent[currentPointerType === 'touch' ? 'touch' : 'mouse']
    }

    function shouldIgnoreEvent(event: Event): boolean {
      const computedOutsidePressEvent = getOutsidePressEventType()
      return (
        (computedOutsidePressEvent === 'intentional' && event.type !== 'click') ||
        (computedOutsidePressEvent === 'sloppy' && event.type === 'click')
      )
    }

    function closeOnPressOutside(event: MouseEvent | TouchEvent) {
      // UI Events dispatches `click` at the nearest common inclusive ancestor of the
      // `pointerdown` and `pointerup` targets, so a drag out of the popup would report an
      // outside target. Where the press started is what decides inside vs. outside.
      const eventTarget = getTarget(event)
      let target: Element | null = isElement(eventTarget) ? eventTarget : null
      if (event.type === 'click') {
        target = pressStartTarget ?? target
        pressStartTarget = null
      }

      if (shouldIgnoreEvent(event)) {
        clearInsideTree()
        return
      }

      if (insideTree) {
        clearInsideTree()
        return
      }

      if (!target) return

      if (isWithinFloatingTree(target)) {
        return
      }

      if (isInjectedAfterOpen(target, popupElement)) {
        return
      }

      if (outsidePress instanceof Function && !outsidePress(event)) return

      if (hasBlockingChild('outsidePress')) {
        return
      }

      onClose(REASONS.outsidePress, event)
      clearInsideTree()
    }

    function closeOnSloppyPointerDown(event: PointerEvent) {
      if (
        getOutsidePressEventType() !== 'sloppy' ||
        event.pointerType === 'touch' ||
        isWithinOwnElements(getTarget(event))
      ) {
        return
      }

      closeOnPressOutside(event)
    }

    function trackTouchStart(event: TouchEvent) {
      if (getOutsidePressEventType() !== 'sloppy' || isWithinOwnElements(getTarget(event))) {
        return
      }

      const touch = event.touches[0]
      if (touch) {
        touchState = {
          startTime: Date.now(),
          startX: touch.clientX,
          startY: touch.clientY,
          dismissOnTouchEnd: false,
          dismissOnMouseDown: true
        }

        cancelDismissOnEndTimeout.start(1000, () => {
          if (touchState) {
            touchState.dismissOnTouchEnd = false
            touchState.dismissOnMouseDown = false
          }
        })
      }
    }

    function ontouchstart(event: TouchEvent) {
      currentPointerType = 'touch'
      addTargetEventListenerOnce(event, trackTouchStart)
    }

    function onPointerDownCapture(event: PointerEvent) {
      cancelDismissOnEndTimeout.clear()

      currentPointerType = event.pointerType

      addTargetEventListenerOnce(event, closeOnSloppyPointerDown)
    }

    function closeOnPressOutsideCapture(event: MouseEvent) {
      cancelDismissOnEndTimeout.clear()

      if (event.type === 'mousedown' && touchState && !touchState.dismissOnMouseDown) {
        return
      }

      addTargetEventListenerOnce(event, closeOnPressOutside)
    }

    function trackTouchMove(event: TouchEvent) {
      if (
        getOutsidePressEventType() !== 'sloppy' ||
        !touchState ||
        isWithinOwnElements(getTarget(event))
      ) {
        return
      }

      const touch = event.touches[0]
      if (!touch) return

      const deltaX = Math.abs(touch.clientX - touchState.startX)
      const deltaY = Math.abs(touch.clientY - touchState.startY)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance > 5) {
        touchState.dismissOnTouchEnd = true
      }

      if (distance > 10) {
        closeOnPressOutside(event)
        cancelDismissOnEndTimeout.clear()
        touchState = null
      }
    }

    function ontouchmove(event: TouchEvent) {
      addTargetEventListenerOnce(event, trackTouchMove)
    }

    function closeOnSloppyTouchEnd(event: TouchEvent) {
      if (
        getOutsidePressEventType() !== 'sloppy' ||
        !touchState ||
        isWithinOwnElements(getTarget(event))
      ) {
        return
      }

      if (touchState.dismissOnTouchEnd) {
        closeOnPressOutside(event)
      }

      cancelDismissOnEndTimeout.clear()
      touchState = null
    }

    function ontouchend(event: TouchEvent) {
      addTargetEventListenerOnce(event, closeOnSloppyTouchEnd)
    }

    function closeOnTriggerPress(event: MouseEvent) {
      const target = getTarget(event)
      if (!isNode(target)) return

      if (!isInsideElement(target)) return

      onClose(REASONS.triggerPress, event)
    }

    function trackPressStart(event: MouseEvent) {
      if (event.button !== 0) return
      const target = getTarget(event)
      if (!isElement(target)) return

      pressStartTarget = target

      if (isWithinOwnElements(target)) markInsideTree()
    }

    const doc = popupElement?.ownerDocument ?? document

    const cleanups: Array<() => void> = []

    if (escapeKey) {
      cleanups.push(
        on(doc, 'keydown', onkeydown),
        on(doc, 'compositionstart', oncompositionstart),
        on(doc, 'compositionend', oncompositionend)
      )

      // The document listener alone runs in registration order, so an outer floating element
      // opened first would consume the key before this one could stop it. Listening on the
      // elements too keeps the innermost element first, where `stopPropagation` still works.
      for (const element of [popupElement, referenceElement]) {
        if (element) cleanups.push(on(element, 'keydown', onkeydown as EventListener))
      }
    }

    if (outsidePress !== false) {
      cleanups.push(
        on(doc, 'click', closeOnPressOutsideCapture, { capture: true }),
        on(doc, 'pointerdown', onPointerDownCapture, { capture: true }),
        on(doc, 'mousedown', closeOnPressOutsideCapture, { capture: true }),
        on(doc, 'touchstart', ontouchstart, { capture: true }),
        on(doc, 'touchmove', ontouchmove, { capture: true }),
        on(doc, 'touchend', ontouchend, { capture: true })
      )

      cleanups.push(
        on(doc, 'pointerdown', trackPressStart, { capture: true }),
        on(doc, 'mousedown', trackPressStart, { capture: true })
      )

      if (popupElement) {
        cleanups.push(
          on(popupElement, 'click', markInsideTree, { capture: true }),
          on(popupElement, 'mouseup', markInsideTree, { capture: true }),
          on(popupElement, 'touchmove', markInsideTree, { capture: true }),
          on(popupElement, 'touchend', markInsideTree, { capture: true })
        )
      }
    }

    if (triggerPress) {
      cleanups.push(on(doc, 'pointerdown', closeOnTriggerPress, { capture: true }))
      cleanups.push(on(doc, 'click', closeOnTriggerPress, { capture: true }))
    }

    return () => {
      if (ownNode) ownNode.dismissBubbles = undefined

      for (const cleanup of cleanups) cleanup()
      // `on()` defers `addEventListener` by a microtask for `pointer*`/`touch*`/`wheel`.
      queueMicrotask(() => {
        for (const cleanup of cleanups) cleanup()
      })
      for (const detach of pendingTargetCleanups) detach()

      compositionTimeout.clear()
      clearInsideTreeTimeout.clear()
      insideTree = false
      pressStartTarget = null
    }
  })
}
