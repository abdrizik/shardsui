import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
import { Button, type ButtonOptions } from '$lib/internal/button.svelte'
import { chain } from '$lib/internal/chain'
import { PATIENT_CLICK_THRESHOLD } from '$lib/internal/constants'
import type { DirectionContextValue } from '$lib/internal/direction-context'
import { contains } from '$lib/internal/dom'
import { CompositeItem, type Composite } from '$lib/internal/floating/composite.svelte'
import { isClickLikeEvent } from '$lib/internal/floating/event'
import {
  applySafePolygonPointerEventsMutation,
  clearSafePolygonPointerEventsMutation,
  getHoverInteraction,
  type HoverInteraction
} from '$lib/internal/floating/hover/interaction.svelte'
import type { CloseGuardContextBase } from '$lib/internal/floating/hover/predicates'
import { hoverReferenceInteraction } from '$lib/internal/floating/hover/reference.svelte'
import { safePolygon } from '$lib/internal/floating/safe-polygon.svelte'
import {
  getNextTabbable,
  getPreviousTabbable,
  getTabbableAfterElement,
  isOutsideEvent
} from '$lib/internal/floating/tabbable'
import type { HoverContext } from '$lib/internal/floating/types'
import { REASONS } from '$lib/internal/reasons'
import { Timeout } from '$lib/internal/timeout'
import { flushSync } from 'svelte'
import type { NavigationMenuItemContext } from './context'
import { type ActivationDirection, type NavigationMenuRoot } from './navigation-menu.svelte'

function sideFromElements(
  domReferenceElement: Element,
  floatingElement: HTMLElement
): CloseGuardContextBase['side'] {
  const referenceRect = domReferenceElement.getBoundingClientRect()
  const floatingRect = floatingElement.getBoundingClientRect()
  const referenceCenterX = referenceRect.left + referenceRect.width / 2
  const referenceCenterY = referenceRect.top + referenceRect.height / 2
  const floatingCenterX = floatingRect.left + floatingRect.width / 2
  const floatingCenterY = floatingRect.top + floatingRect.height / 2
  const deltaX = floatingCenterX - referenceCenterX
  const deltaY = floatingCenterY - referenceCenterY
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? 'right' : 'left'
  }
  return deltaY >= 0 ? 'bottom' : 'top'
}

type NavigationMenuTriggerOptions = Pick<
  ButtonOptions,
  'as' | 'onclick' | 'onmousedown' | 'onkeydown' | 'onkeyup' | 'onpointerdown'
> & {
  ref: HTMLElement | null
  triggerId: string
  disabled: boolean
}

export class NavigationMenuTrigger {
  #navigationMenu: NavigationMenuRoot
  #item: NavigationMenuItemContext
  #direction: DirectionContextValue
  #options: () => NavigationMenuTriggerOptions

  #pointerType: PointerEvent['pointerType'] = $state('')
  #allowFocus = false
  #stickIfOpen = true

  #stickIfOpenTimeout = new Timeout()
  #focusFrame = new AnimationFrame()

  #hoverInstance: HoverInteraction
  #button: Button
  #compositeItem: CompositeItem | null

  isActive = $derived.by(
    () => this.#navigationMenu.open && this.#item.value === this.#navigationMenu.value
  )

  #blocksSafePolygonPointerEvents = $derived(this.#pointerType !== 'touch')

  #triggerId = $derived.by(() => this.#options().triggerId)

  get attrs() {
    return this.#button.attrs
  }

  get attach() {
    return this.#button.attach
  }

  constructor(
    navigationMenu: NavigationMenuRoot,
    item: NavigationMenuItemContext,
    composite: Composite | undefined,
    direction: DirectionContextValue,
    options: () => NavigationMenuTriggerOptions
  ) {
    this.#navigationMenu = navigationMenu
    this.#item = item
    this.#direction = direction
    this.#options = options

    this.#hoverInstance = getHoverInteraction(navigationMenu.data)

    this.#compositeItem = composite
      ? new CompositeItem(() => ({
          composite,
          ref: this.#options().ref,
          disabled: this.#options().disabled
        }))
      : null

    const safePolygonGuard = safePolygon(() => ({
      getScope: this.#getScope,
      blockPointerEvents: this.#blocksSafePolygonPointerEvents
    }))

    this.#button = new Button(() => ({
      disabled: this.#options().disabled,
      focusableWhenDisabled: true,
      as: this.#options().as,
      composite: true,
      onclick: chain(this.#options().onclick, this.#onclick),
      onmousedown: this.#options().onmousedown,
      onkeydown: chain(this.#options().onkeydown, this.#onkeydown),
      onkeyup: this.#options().onkeyup,
      onpointerdown: chain(this.#options().onpointerdown, this.#onpointerdown)
    }))

    $effect(this.#stickIfOpenTimeout.disposeEffect)
    $effect(this.#focusFrame.disposeEffect)

    const hoverRoot: HoverContext = {
      get data() {
        return navigationMenu.data
      },
      get triggerElements() {
        return navigationMenu.triggerElements
      },
      get open() {
        return navigationMenu.open
      },
      get transitionStatus() {
        return navigationMenu.transitionStatus
      },
      get domReferenceElement() {
        return navigationMenu.domReferenceElement
      },
      get floatingElement() {
        return navigationMenu.floatingElement
      },
      setOpen: (open, reason, event, trigger) => {
        if (reason === REASONS.triggerHover && navigationMenu.interactionsEnabled) {
          this.#armStickIfOpen()
        }
        navigationMenu.setOpen(open, reason, event, trigger ?? this.#options().ref)
      }
    }

    hoverReferenceInteraction(hoverRoot, () => ({
      enabled: navigationMenu.hoverInteractionsEnabled && !this.#options().disabled,
      move: false,
      shouldAllowOpen: this.#pointerType !== 'touch',
      shouldAllowClose: this.#pointerType !== 'touch',
      closeGuard: safePolygonGuard,
      restMs: navigationMenu.mounted && navigationMenu.positionerElement ? 0 : navigationMenu.delay,
      delay: { close: navigationMenu.closeDelay },
      triggerElement: this.#options().ref,
      isActiveTrigger: this.isActive,
      tree: navigationMenu.floatingTree,
      inlineCloseGuardContext: this.#inlineCloseGuardContext()
    }))

    $effect(() => {
      if (!navigationMenu.open) {
        navigationMenu.data.openEvent = undefined
        this.#hoverInstance.pointerType = undefined
        this.#hoverInstance.interactedInside = false
        this.#hoverInstance.restTimeoutPending = false
        this.#hoverInstance.openChangeTimeout.clear()
        this.#hoverInstance.restTimeout.clear()
        this.#stickIfOpenTimeout.clear()
        this.#pointerType = ''
      }

      return () => clearSafePolygonPointerEventsMutation(this.#hoverInstance)
    })

    $effect(() => {
      const ref = this.#options().ref
      if (this.isActive && ref) {
        navigationMenu.prevTriggerElement = ref
      }
    })

    $effect(() => {
      if (this.isActive && navigationMenu.popupElement && this.#allowFocus) {
        this.#allowFocus = false
        this.#focusFrame.request(() => {
          navigationMenu.beforeOutsideElement?.focus()
        })
      }
      return () => this.#focusFrame.cancel()
    })
  }

  registerTrigger = (element: HTMLElement): (() => void) => {
    return this.#navigationMenu.registerTrigger(this.#item.value, this.#triggerId, element)
  }

  #getScope = (): HTMLElement | null => {
    if (!this.#navigationMenu.nested || !this.#navigationMenu.positionerElement) {
      return this.#options().ref?.closest<HTMLElement>('ul') ?? null
    }
    return null
  }

  #inlineCloseGuardContext(): CloseGuardContextBase | null {
    const ref = this.#options().ref
    const floating = this.#navigationMenu.floatingElement
    if (
      !this.#navigationMenu.nested ||
      this.#navigationMenu.positionerElement ||
      !ref ||
      !floating
    ) {
      return null
    }
    return {
      side: sideFromElements(ref, floating),
      elements: { domReference: ref, floating },
      nodeId: this.#navigationMenu.floatingNodeId
    }
  }

  #activationDirection(): ActivationDirection {
    const prevTrigger = this.#navigationMenu.prevTriggerElement
    const ref = this.#options().ref
    if (!prevTrigger || !ref) return null
    const prev = prevTrigger.getBoundingClientRect()
    const next = ref.getBoundingClientRect()
    if (this.#navigationMenu.orientation === 'horizontal' && next.left !== prev.left) {
      return next.left > prev.left ? 'right' : 'left'
    }
    if (this.#navigationMenu.orientation === 'vertical' && next.top !== prev.top) {
      return next.top > prev.top ? 'down' : 'up'
    }
    return null
  }

  #armStickIfOpen(): void {
    this.#stickIfOpen = true
    this.#stickIfOpenTimeout.clear()
    this.#stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
      this.#stickIfOpen = false
    })
  }

  #activate(event: MouseEvent | KeyboardEvent): void {
    const navigationMenu = this.#navigationMenu
    flushSync(() => {
      if (navigationMenu.mounted && navigationMenu.prevTriggerElement && this.#options().ref) {
        const activationDirection = this.#activationDirection()
        if (activationDirection) navigationMenu.activationDirection = activationDirection
      }

      if (event.type !== 'click' && navigationMenu.value != null) {
        navigationMenu.data.openEvent = undefined
      }

      if (this.#pointerType === 'touch' && event.type !== 'click') {
        return
      }

      const prevValue = navigationMenu.value

      if (navigationMenu.value != null) {
        if (prevValue !== this.#item.value || isClickLikeEvent(event.type)) {
          navigationMenu.data.openEvent = event
        }
        if (event.type !== 'keydown') {
          navigationMenu.setValue(
            this.#item.value,
            event.type === 'mouseenter' ? REASONS.triggerHover : REASONS.triggerPress,
            event
          )
        }
      }

      const floating = navigationMenu.floatingElement
      const trigger = this.#options().ref
      if (
        event.type === 'mouseenter' &&
        this.#blocksSafePolygonPointerEvents &&
        (!navigationMenu.nested || !navigationMenu.positionerElement) &&
        floating &&
        trigger
      ) {
        const applyPointerEventsMutation = () => {
          const scopeElement = this.#getScope() ?? trigger.ownerDocument.body
          applySafePolygonPointerEventsMutation(this.#hoverInstance, {
            scopeElement,
            referenceElement: trigger,
            floatingElement: floating
          })
        }

        if (prevValue != null && prevValue !== this.#item.value) {
          queueMicrotask(applyPointerEventsMutation)
        } else {
          applyPointerEventsMutation()
        }
      }
    })
  }

  #activateWithSizing(event: MouseEvent | KeyboardEvent): void {
    const previousSize = this.#navigationMenu.sizing.measureBeforeValueChange(
      this.#item.value,
      event.type === 'click' || this.#pointerType !== 'touch'
    )

    this.#activate(event)

    if (previousSize) this.#navigationMenu.sizing.morphFrom(previousSize)
  }

  #shouldOpenOnClick(): boolean {
    if (!this.#navigationMenu.open || !this.isActive) return true
    const openEvent = this.#navigationMenu.data.openEvent
    if (openEvent && this.#stickIfOpen) {
      return !isClickLikeEvent(openEvent.type)
    }
    return false
  }

  #onclick = (event: MouseEvent): void => {
    if (this.#options().disabled) return
    const nextOpen = this.#navigationMenu.interactionsEnabled ? this.#shouldOpenOnClick() : false
    this.#activateWithSizing(event)
    if (this.#navigationMenu.interactionsEnabled) {
      this.#navigationMenu.setOpen(nextOpen, REASONS.triggerPress, event, this.#options().ref)
    }
  }

  onmouseenter = (event: MouseEvent): void => {
    if (this.#options().disabled) return
    this.#activateWithSizing(event)
  }

  onmousemove = (): void => {
    this.#allowFocus = false
  }

  onpointerenter = (event: PointerEvent): void => {
    this.#pointerType = event.pointerType
  }

  #onpointerdown = (event: PointerEvent): void => {
    this.#pointerType = event.pointerType
    clearSafePolygonPointerEventsMutation(this.#hoverInstance)
  }

  onfocus = (): void => {
    this.#compositeItem?.onfocus()
    if (this.isActive) this.#navigationMenu.viewportInert = false
  }

  onblur = (event: FocusEvent): void => {
    this.#navigationMenu.closeOnFocusOut(this.#options().ref, event)
  }

  focusBeforeGuard = (event: FocusEvent): void => {
    if (
      this.#navigationMenu.floatingElement &&
      isOutsideEvent(event, this.#navigationMenu.floatingElement)
    ) {
      this.#navigationMenu.beforeInsideElement?.focus()
    } else {
      getPreviousTabbable(this.#options().ref)?.focus()
    }
  }

  focusAfterGuard = (event: FocusEvent): void => {
    const navigationMenu = this.#navigationMenu
    const ref = this.#options().ref
    if (navigationMenu.floatingElement && isOutsideEvent(event, navigationMenu.floatingElement)) {
      flushSync(() => {
        navigationMenu.viewportInert = false
      })
      const elementToFocus = navigationMenu.afterInsideElement || ref
      elementToFocus?.focus()
      return
    }

    let nextTabbable = getNextTabbable(ref)

    if (
      navigationMenu.nested &&
      !navigationMenu.positionerElement &&
      navigationMenu.floatingElement &&
      nextTabbable &&
      contains(navigationMenu.floatingElement, nextTabbable)
    ) {
      nextTabbable = getTabbableAfterElement(navigationMenu.afterInsideElement)
    }

    nextTabbable?.focus()

    if (
      (!navigationMenu.nested || navigationMenu.positionerElement) &&
      !contains(navigationMenu.rootElement, nextTabbable)
    ) {
      navigationMenu.setValue(null, REASONS.focusOut, event)
    }
  }

  #onkeydown = (event: KeyboardEvent): void => {
    if (this.#options().disabled) return
    this.#allowFocus = true

    if (this.#navigationMenu.nested) return

    const isHorizontal = this.#navigationMenu.orientation === 'horizontal'
    const verticalOpenKey = this.#direction.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const openHorizontal = isHorizontal && event.key === 'ArrowDown'
    const openVertical = !isHorizontal && event.key === verticalOpenKey

    if (openHorizontal || openVertical) {
      flushSync(() => {
        this.#navigationMenu.setValue(this.#item.value, REASONS.listNavigation, event)
        this.#activateWithSizing(event)
      })
      event.preventDefault()
      event.stopPropagation()
    }
  }
}
