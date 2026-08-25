import { contains, getTarget } from '$lib/internal/dom'
import { getNodeName, isElement, isHTMLElement } from '@floating-ui/utils/dom'
import { untrack } from 'svelte'
import { on } from 'svelte/events'
import {
  AnimationFrame,
  cancelAnimationFrameTick,
  requestAnimationFrameTick
} from '../animation-frame.svelte'
import {
  CLICK_TRIGGER_SELECTOR,
  FOCUS_GUARD_ATTRIBUTE,
  SHARDSUI_PORTAL_SELECTOR
} from '../constants'
import { isWebKit } from '../detect-browser'
import { isInjectedAfterOpen } from '../is-injected-after-open'
import { REASONS } from '../reasons'
import { Timeout } from '../timeout'
import { visuallyHidden } from '../visually-hidden'
import { getFloatingFocusElement } from './element'
import { isVirtualClick, isVirtualPointerEvent } from './event'
import {
  FloatingNodeContext,
  FloatingTreeContext,
  getNodeAncestors,
  getNodeChildren
} from './floating-tree.svelte'
import { isElementVisible } from './list-navigation'
import { markOthers } from './mark-others'
import { containsThroughPortals } from './portal'
import {
  focusable,
  isTabbable,
  isTypeableCombobox,
  isTypeableElement,
  managedTabIndex,
  tabbable,
  type FocusableElement
} from './tabbable'

export type FocusTarget =
  | boolean
  | HTMLElement
  | ((interactionType: string) => HTMLElement | boolean | null | void)
  | undefined

type FocusManagerOptions = {
  open: boolean
  modal: boolean
  enabled: boolean
  popupElement: HTMLElement | null
  triggerElement: HTMLElement | null
  initialFocus: FocusTarget
  finalFocus: FocusTarget
  openMethod?: string | null | undefined
  closeEvent?: Event | null | undefined
  closeReason?: string | null | undefined
  closeOnFocusOut?: boolean
  onFocusOut?: (event: FocusEvent) => void
  getNextFocusableElement?: () => HTMLElement | null
  restoreFocus?: boolean | 'popup'
  insideElements?: Array<HTMLElement | null>
}

function getEventType(event: Event | null | undefined, lastInteractionType: string): string {
  if (!event) return lastInteractionType || 'mouse'
  const eventTarget = getTarget(event)
  const win = (isElement(eventTarget) ? eventTarget.ownerDocument.defaultView : null) ?? window
  if (event instanceof win.KeyboardEvent) return 'keyboard'
  if (event instanceof win.FocusEvent) return lastInteractionType || 'keyboard'
  if ('pointerType' in event) return (event as PointerEvent).pointerType || 'keyboard'
  if ('touches' in event) return 'touch'
  if (event instanceof win.MouseEvent) {
    return lastInteractionType || (event.detail === 0 ? 'keyboard' : 'mouse')
  }
  return ''
}

const LIST_LIMIT = 20
// Shared across every instance, so a dialog opened from another dialog can restore focus
// past a popup that has already unmounted.
let previouslyFocusedElements: WeakRef<Element>[] = []

function clearDisconnectedPreviouslyFocusedElements() {
  previouslyFocusedElements = previouslyFocusedElements.filter((entry) => {
    return entry.deref()?.isConnected
  })
}

function addPreviouslyFocusedElement(element: Element | null | undefined) {
  clearDisconnectedPreviouslyFocusedElements()
  if (element && getNodeName(element) !== 'body') {
    previouslyFocusedElements.push(new WeakRef(element))
    if (previouslyFocusedElements.length > LIST_LIMIT) {
      previouslyFocusedElements = previouslyFocusedElements.slice(-LIST_LIMIT)
    }
  }
}

function getPreviouslyFocusedElement() {
  clearDisconnectedPreviouslyFocusedElements()
  return previouslyFocusedElements[previouslyFocusedElements.length - 1]?.deref()
}

function getFirstTabbableElement(container: Element | null) {
  if (!container) {
    return null
  }
  return tabbable(container)[0] ?? container
}

function supportsPreventScroll(doc: Document): boolean {
  let supported = false
  doc.createElement('div').focus({
    get preventScroll() {
      supported = true
      return false
    }
  })
  return supported
}

function applyTabIndex(floatingFocusElement: HTMLElement) {
  if (floatingFocusElement.hasAttribute('tabindex') && !managedTabIndex.has(floatingFocusElement)) {
    return
  }

  if (!floatingFocusElement.getAttribute('role')?.includes('dialog')) {
    return
  }

  const tabbableSet = new Set<Element>(tabbable(floatingFocusElement))
  const focusableElements = focusable(floatingFocusElement)
  const tabbableContent = focusableElements.filter((element) => {
    const managed = managedTabIndex.get(element)
    return tabbableSet.has(element) || (managed != null && !managed.startsWith('-'))
  })
  const tabIndex = floatingFocusElement.getAttribute('tabindex')

  if (tabbableContent.length === 0) {
    if (tabIndex !== '0') {
      floatingFocusElement.setAttribute('tabindex', '0')
      // Record our own write so the externally-managed early-return above doesn't
      // mistake it for a user-authored `tabindex` and freeze management.
      managedTabIndex.set(floatingFocusElement, '0')
    }
  } else if (
    tabIndex !== '-1' ||
    (managedTabIndex.has(floatingFocusElement) &&
      managedTabIndex.get(floatingFocusElement) !== '-1')
  ) {
    floatingFocusElement.setAttribute('tabindex', '-1')
    managedTabIndex.set(floatingFocusElement, '-1')
  }
}

export function manageFocus(options: () => FocusManagerOptions): void {
  const floatingTree = FloatingTreeContext.getOr()
  const nodeId = FloatingNodeContext.getOr()?.id
  const pointerDownTimeout = new Timeout()
  const restoreFocusFrame = new AnimationFrame()

  let previouslyFocused: HTMLElement | null = null
  let undoAriaHidden: (() => void) | null = null
  let undoMarkers: (() => void) | null = null
  let preventReturnFocus = false
  let beforeSentinelElement: HTMLSpanElement | null = null
  let afterSentinelElement: HTMLSpanElement | null = null
  let isPointerDown = false
  let lastInteractionType = ''
  let lastFocusedTabbable: FocusableElement | null = null
  let lastOpen = false
  let lastPopupElement: HTMLElement | null = null
  let lastFinalFocus: FocusTarget = undefined
  let openMethodAtOpen: string | null | undefined
  let lastCloseEvent: Event | null | undefined
  let lastCloseReason: string | null | undefined

  const open = $derived(options().open)
  const modal = $derived(options().modal)
  const enabled = $derived(options().enabled)
  const popupElement = $derived(options().popupElement)
  const triggerElement = $derived(options().triggerElement)
  const initialFocus = $derived(options().initialFocus)
  const finalFocus = $derived(options().finalFocus)
  const openMethod = $derived(options().openMethod)
  const closeEvent = $derived(options().closeEvent)
  const closeReason = $derived(options().closeReason)
  const closeOnFocusOut = $derived(options().closeOnFocusOut)
  const onFocusOut = $derived(options().onFocusOut)
  const getNextFocusableElement = $derived(options().getNextFocusableElement)
  const restoreFocus = $derived(options().restoreFocus)
  const insideElements = $derived(options().insideElements)

  const active = $derived(open && popupElement !== null && enabled)
  const hasNonModalGuards = $derived(getNextFocusableElement != null)

  const isUntrappedTypeableCombobox = $derived(
    isTypeableCombobox(triggerElement) && initialFocus === false
  )

  function markPointerDown(): void {
    isPointerDown = true
    pointerDownTimeout.start(0, () => {
      isPointerDown = false
    })
  }

  function clearMarkOthers(): void {
    undoMarkers?.()
    undoMarkers = null
    undoAriaHidden?.()
    undoAriaHidden = null
  }

  function isRelatedFocusGuard(node: Element | null): boolean {
    if (node == null || !node.hasAttribute(FOCUS_GUARD_ATTRIBUTE)) return false
    return (
      node === beforeSentinelElement ||
      node === afterSentinelElement ||
      node === getNextFocusableElement?.()
    )
  }

  function relatedFloatingElements(): HTMLElement[] {
    if (!floatingTree || !nodeId) return []
    return [
      ...getNodeChildren(floatingTree.nodes, nodeId),
      ...getNodeAncestors(floatingTree.nodes, nodeId)
    ]
      .map((treeNode) => treeNode.floating)
      .filter((element) => element != null)
  }

  function isInsideFloatingTree(node: Element | null): boolean {
    return node != null && relatedFloatingElements().some((element) => contains(element, node))
  }

  function isInsideNestedFloatingElement(node: Element | null): boolean {
    if (node == null || !floatingTree || !nodeId) return false
    return getNodeChildren(floatingTree.nodes, nodeId).some((child) =>
      contains(child.floating, node)
    )
  }

  function isNested(): boolean {
    if (!floatingTree || !nodeId) return false
    return (floatingTree.nodes.find((treeNode) => treeNode.id === nodeId)?.parentId ?? null) != null
  }

  function syncOutsideMarkers(): (() => void) | void {
    const popup = popupElement
    const trigger = triggerElement

    if (!active || !popup) {
      clearMarkOthers()
      return
    }

    const portalElements: HTMLElement[] = []
    const portalParent = popup.closest(SHARDSUI_PORTAL_SELECTOR)
    if (portalParent) {
      const nestedPortals = portalParent.querySelectorAll(SHARDSUI_PORTAL_SELECTOR)
      portalElements.push(
        portalParent as HTMLElement,
        ...(Array.from(nestedPortals) as HTMLElement[])
      )
    }

    if (modal || isUntrappedTypeableCombobox) {
      const avoidElements = [popup, ...portalElements]
      if (trigger && isUntrappedTypeableCombobox) avoidElements.push(trigger)
      for (const el of untrack(() => insideElements) ?? []) {
        if (el) avoidElements.push(el)
      }

      if (floatingTree && nodeId) {
        void floatingTree.version
        for (const child of getNodeChildren(floatingTree.nodes, nodeId)) {
          if (child.floating) avoidElements.push(child.floating)
        }
      }

      undoAriaHidden = markOthers(avoidElements, { ariaHidden: true, mark: false })
    }

    undoMarkers = markOthers([popup, ...portalElements], { mark: true })

    return () => clearMarkOthers()
  }

  /**
   * Safari randomly scrolls to the bottom of the page when an input inside a popup still has
   * focus as the popup unmounts; blurring it first prevents that.
   */
  function blurTypeableBeforeUnmount(): void {
    const popup = popupElement

    if (!isWebKit || open || !popup) {
      return
    }

    const activeEl = popup.ownerDocument.activeElement
    if (!isHTMLElement(activeEl) || !isTypeableElement(activeEl)) {
      return
    }

    if (contains(popup, activeEl)) {
      activeEl.blur()
    }
  }

  function trackInteractionType(): (() => void) | void {
    const popup = popupElement
    if (!open || !popup || !enabled) return

    const doc = popup.ownerDocument

    const onpointerdown = (event: PointerEvent) => {
      lastInteractionType = event.pointerType || 'keyboard'

      const target = getTarget(event)
      if (isElement(target) && target.closest(CLICK_TRIGGER_SELECTOR)) {
        markPointerDown()
      }
    }

    const onkeydown = () => {
      lastInteractionType = 'keyboard'
    }

    const cleanups = [
      on(doc, 'pointerdown', onpointerdown, { capture: true }),
      on(doc, 'keydown', onkeydown, { capture: true })
    ]
    return () => cleanups.forEach((cleanup) => cleanup())
  }

  function captureReturnFocusState(): void {
    lastOpen = open
    lastPopupElement = popupElement
    lastFinalFocus = finalFocus
    lastCloseEvent = closeEvent
    lastCloseReason = closeReason
  }

  function trackReturnFocus(): (() => void) | void {
    const popup = popupElement
    const trigger = triggerElement
    if (!active || !popup) return

    previouslyFocused = popup.ownerDocument.activeElement as HTMLElement | null
    addPreviouslyFocusedElement(previouslyFocused)
    openMethodAtOpen = untrack(() => openMethod)

    return () => restoreReturnFocus(trigger)
  }

  function applyInitialFocus(): (() => void) | void {
    const popup = popupElement
    if (!active || !popup) return

    lastInteractionType = ''

    const doc = popup.ownerDocument

    if (initialFocus === false) return

    const interactionType = untrack(() => openMethod) ?? 'mouse'

    const floatingFocusElement = getFloatingFocusElement(popup)

    if (contains(floatingFocusElement, doc.activeElement)) return

    const target = isHTMLElement(initialFocus)
      ? initialFocus
      : (() => {
          if (typeof initialFocus === 'function') {
            const result = initialFocus(interactionType)
            if (isHTMLElement(result)) return result
            if (result === false || result === undefined) return null
          }
          const tabbableElements = tabbable(floatingFocusElement)
          return tabbableElements[0] ?? floatingFocusElement
        })()

    if (!target) return

    const frameId = requestAnimationFrameTick(() => {
      const active = doc.activeElement
      if (active && contains(popup, active)) return
      // A nested popup opened during this frame renders outside the subtree, so `popup.contains`
      // above cannot see that it took focus and the tree has to be consulted too.
      if (active && containsThroughPortals(popup, active)) return
      if (isInsideNestedFloatingElement(active)) return
      target.focus({ preventScroll: true })
    })

    return () => cancelAnimationFrameTick(frameId)
  }

  function restoreReturnFocus(trigger: HTMLElement | null): void {
    if (lastOpen || !previouslyFocused) {
      preventReturnFocus = false
      return
    }

    if (preventReturnFocus) {
      preventReturnFocus = false
      previouslyFocused = null
      return
    }

    if (lastCloseReason === REASONS.triggerHover && lastCloseEvent?.type === 'mouseleave') {
      previouslyFocused = null
      return
    }

    if (lastCloseReason === REASONS.outsidePress && !isNested()) {
      const pressEvent = lastCloseEvent as MouseEvent | PointerEvent | null | undefined
      const virtual =
        !!pressEvent &&
        (isVirtualClick(pressEvent) || isVirtualPointerEvent(pressEvent as PointerEvent))

      if (!virtual && !supportsPreventScroll(lastPopupElement?.ownerDocument ?? document)) {
        previouslyFocused = null
        return
      }
    }

    if (lastFinalFocus === false) {
      previouslyFocused = null
      return
    }

    const interactionType = getEventType(lastCloseEvent, lastInteractionType)

    const preferPreviousFocus = openMethodAtOpen == null

    const previousFocusTarget = previouslyFocused
    const referenceReturnElement = trigger?.isConnected ? trigger : null
    const previousReturnElement =
      previousFocusTarget?.isConnected && getNodeName(previousFocusTarget) !== 'body'
        ? previousFocusTarget
        : null

    let defaultReturnElement = preferPreviousFocus
      ? previousReturnElement || referenceReturnElement
      : referenceReturnElement || previousReturnElement

    if (!defaultReturnElement) {
      defaultReturnElement = (getPreviouslyFocusedElement() ?? null) as HTMLElement | null
    }

    let target: HTMLElement | null = null
    if (isHTMLElement(lastFinalFocus)) {
      target = lastFinalFocus
    } else if (typeof lastFinalFocus === 'function') {
      const result = lastFinalFocus(interactionType)
      if (isHTMLElement(result)) target = result
    }

    if (!target) target = defaultReturnElement

    const hasExplicitReturnFocus =
      isHTMLElement(lastFinalFocus) || typeof lastFinalFocus === 'function'
    const popup = lastPopupElement
    const doc = popup?.ownerDocument ?? document

    const captured = getFirstTabbableElement(target) as HTMLElement | null
    // The microtask runs after this popup unmounts, where reading a `$derived` warns and returns
    // its last cached value, so the tree is resolved here alongside `popup`/`doc`/`captured`.
    const relatedFloating = relatedFloatingElements()
    queueMicrotask(() => {
      const active = doc.activeElement
      const focusInsideTree =
        contains(popup, active) ||
        (active != null && relatedFloating.some((element) => contains(element, active)))
      if (
        !hasExplicitReturnFocus &&
        captured !== active &&
        active !== doc.body &&
        !focusInsideTree
      ) {
        previouslyFocused = null
        return
      }
      captured?.focus({
        preventScroll: true,
        focusVisible: interactionType === 'keyboard' ? true : undefined
      })
    })
    previouslyFocused = null
  }

  function closeOnFocusOutside(): (() => void) | void {
    const popup = popupElement
    if (!active || !popup) return
    if (!closeOnFocusOut || onFocusOut == null) return

    const trigger = triggerElement
    const trapsFocus = modal
    const untrappedCombobox = isUntrappedTypeableCombobox

    let disposed = false

    const isInside = (node: Element | null) => {
      if (!node) return false
      if (containsThroughPortals(popup, node)) return true
      if (contains(trigger, node)) return true
      for (const el of insideElements ?? []) {
        if (contains(el, node)) return true
      }
      return false
    }

    const dismissIfFocusLeft = (event: FocusEvent, fromTrigger: boolean) => {
      const relatedTarget = event.relatedTarget as Element | null
      const target = getTarget(event)

      if (trapsFocus && relatedTarget == null && isElement(target) && contains(popup, target)) {
        addPreviouslyFocusedElement(target)
      }

      if (isPointerDown) return

      queueMicrotask(() => {
        if (disposed) return
        if (fromTrigger) {
          applyTabIndex(getFloatingFocusElement(popup))
        }

        if (
          isInside(relatedTarget) ||
          isInsideFloatingTree(relatedTarget) ||
          isRelatedFocusGuard(relatedTarget)
        )
          return

        if (!relatedTarget) return

        if (isElement(relatedTarget) && isInjectedAfterOpen(relatedTarget, popup)) return

        if (trapsFocus && !untrappedCombobox) return

        if (!untrappedCombobox && relatedTarget === getPreviouslyFocusedElement()) {
          return
        }

        preventReturnFocus = true
        onFocusOut!(event)
      })
    }

    const cleanups = [on(popup, 'focusout', (event) => dismissIfFocusLeft(event, false))]
    if (trigger) {
      cleanups.push(
        on(trigger, 'focusout', (event) => dismissIfFocusLeft(event, true)),
        // In Safari, buttons lose focus when pressing them.
        on(trigger, 'pointerdown', markPointerDown)
      )
    }
    return () => {
      disposed = true
      cleanups.forEach((cleanup) => cleanup())
    }
  }

  function restoreFocusInsidePopup(): (() => void) | void {
    const popup = popupElement
    const restorePopupOnly = restoreFocus === 'popup'
    if (!restoreFocus || !active || !popup) return

    const onfocusin = (event: FocusEvent) => {
      const target = getTarget(event)
      if (isElement(target) && isTabbable(target)) lastFocusedTabbable = target
    }

    const onfocusout = (event: FocusEvent) => {
      const target = getTarget(event)
      const floatingFocusElement = getFloatingFocusElement(popup)

      queueMicrotask(() => {
        if (isElement(target) && isElementVisible(target)) return
        const doc = popup.ownerDocument
        const active = doc.activeElement
        if (active !== doc.body) return

        floatingFocusElement.focus()

        if (restorePopupOnly) {
          // An element removed during the same pointerdown drops the focus set above.
          restoreFocusFrame.request(() => {
            floatingFocusElement.focus()
          })
          return
        }

        const tabbableContent = tabbable(floatingFocusElement)
        const previous = lastFocusedTabbable
        const next =
          (previous && tabbableContent.includes(previous) ? previous : null) ??
          tabbableContent[tabbableContent.length - 1] ??
          floatingFocusElement
        next.focus()
      })
    }

    const offFocusIn = on(popup, 'focusin', onfocusin)
    const offFocusOut = on(popup, 'focusout', onfocusout)
    return () => {
      offFocusIn()
      offFocusOut()
      lastFocusedTabbable = null
      restoreFocusFrame.cancel()
    }
  }

  function renderFocusGuards(): (() => void) | void {
    const popup = popupElement
    const isModal = modal

    if (!active || !popup || isUntrappedTypeableCombobox || (!isModal && !hasNonModalGuards)) return

    const doc = popup.ownerDocument

    function makeSentinel(): HTMLSpanElement {
      const span = doc.createElement('span')
      span.setAttribute('tabindex', '0')
      span.setAttribute('aria-hidden', 'true')
      span.setAttribute(FOCUS_GUARD_ATTRIBUTE, '')
      span.style.cssText = visuallyHidden
      return span
    }

    const beforeSentinel = makeSentinel()
    const afterSentinel = makeSentinel()

    const detachBeforeSentinel = on(beforeSentinel, 'focus', (event) => {
      const floatingFocusElement = getFloatingFocusElement(popup)
      const tabbableElements = tabbable(floatingFocusElement)
      if (isModal) {
        ;(tabbableElements[tabbableElements.length - 1] ?? floatingFocusElement).focus()
        return
      }
      preventReturnFocus = false
      const related = event.relatedTarget as Node | null
      if (contains(popup, related)) {
        triggerElement?.focus()
      } else {
        ;(tabbableElements[0] ?? floatingFocusElement).focus()
      }
    })

    const detachAfterSentinel = on(afterSentinel, 'focus', (event) => {
      const floatingFocusElement = getFloatingFocusElement(popup)
      const tabbableElements = tabbable(floatingFocusElement)
      if (isModal) {
        ;(tabbableElements[0] ?? floatingFocusElement).focus()
        return
      }
      const related = event.relatedTarget as Node | null
      if (contains(popup, related)) {
        if (closeOnFocusOut) {
          preventReturnFocus = true
        }
        getNextFocusableElement?.()?.focus()
      } else {
        ;(tabbableElements[tabbableElements.length - 1] ?? floatingFocusElement).focus()
      }
    })

    const parent = popup.parentNode
    if (parent) {
      parent.insertBefore(beforeSentinel, popup)
      parent.insertBefore(afterSentinel, popup.nextSibling)
    }

    beforeSentinelElement = beforeSentinel
    afterSentinelElement = afterSentinel

    return () => {
      detachBeforeSentinel()
      detachAfterSentinel()
      beforeSentinel.remove()
      afterSentinel.remove()
      beforeSentinelElement = null
      afterSentinelElement = null
    }
  }

  function blockTabWithNoTabbableContent(): (() => void) | void {
    const popup = popupElement
    if (!active || !popup || !modal || isUntrappedTypeableCombobox) return

    const onkeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const tabbableElements = tabbable(getFloatingFocusElement(popup))
      if (tabbableElements.length === 0) {
        event.preventDefault()
      }
    }

    return on(popup, 'keydown', onkeydown, { capture: true })
  }

  function syncFloatingTabIndex(): (() => void) | void {
    const popup = popupElement
    if (!active || !popup) return

    const syncTabIndex = () => {
      applyTabIndex(getFloatingFocusElement(popup))
    }

    syncTabIndex()

    const observer = new MutationObserver(syncTabIndex)
    observer.observe(popup, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'hidden', 'inert']
    })

    return () => {
      observer.disconnect()
      queueMicrotask(clearDisconnectedPreviouslyFocusedElements)
    }
  }

  $effect(pointerDownTimeout.disposeEffect)
  $effect(restoreFocusFrame.disposeEffect)
  $effect(syncOutsideMarkers)
  $effect(blurTypeableBeforeUnmount)
  $effect(trackInteractionType)
  $effect(captureReturnFocusState)
  $effect(trackReturnFocus)
  $effect(applyInitialFocus)
  $effect(closeOnFocusOutside)
  $effect(restoreFocusInsidePopup)
  $effect(renderFocusGuards)
  $effect(blockTabWithNoTabbableContent)
  $effect(syncFloatingTabIndex)
}
