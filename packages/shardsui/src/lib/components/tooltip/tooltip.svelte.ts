import { RootAttachments } from '$lib/internal/detached-handle'
import {
  detachedTriggerSelectionById,
  selectActiveTrigger,
  type ActiveTriggerSelection
} from '$lib/internal/detached-trigger-selection.svelte'
import { dismiss } from '$lib/internal/floating/dismiss.svelte'
import { isClickLikeEvent } from '$lib/internal/floating/event'
import { dispatchOpenChange } from '$lib/internal/floating/hover/interaction.svelte'
import type { FloatingContextData } from '$lib/internal/floating/types'
import { openChangeCompleteClose } from '$lib/internal/open-change-complete.svelte'
import { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { REASONS } from '$lib/internal/reasons'
import { Transition } from '$lib/internal/transition-status.svelte'
import type { TooltipOpenReason } from './context'

type TooltipRootOptions = {
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
  disableHoverablePopup: boolean
  trackCursorAxis: 'none' | 'x' | 'y' | 'both'
  onOpenChange: ((open: boolean) => void) | undefined
  onOpenChangeComplete: ((open: boolean) => void) | undefined
  triggerId: string | null
  setTriggerId: (triggerId: string | null) => void
  floatingId: string
}

type TooltipAttachment = {
  options: () => TooltipRootOptions
  transition: Transition
}

type TooltipTriggerBindings = {
  payload: unknown
  closeDelay: number
  closeOnClick: boolean
}

export type TooltipInstantType = 'delay' | 'dismiss' | 'focus'

export class TooltipRoot<Payload = unknown> {
  triggerElement = $state<HTMLElement | null>(null)
  popupElement = $state<HTMLElement | null>(null)
  positionerElement = $state<HTMLElement | null>(null)
  payload = $state.raw<Payload | undefined>(undefined)
  cursorX = $state<number | null>(null)
  cursorY = $state<number | null>(null)
  openedByMouseEvent = $state(true)
  instantType = $state<TooltipInstantType | undefined>(undefined)
  hasViewport = $state(false)
  openChangeReason = $state<TooltipOpenReason | null>(null)
  closeOnClick = $state(true)
  closeDelay = $state(0)
  isInstantPhase = $state(false)

  data: FloatingContextData = {}
  triggerElements = new PopupTriggerMap<TooltipTriggerBindings>()

  #attached = $state.raw<(() => TooltipRootOptions) | null>(null)
  #previousInstantType: TooltipInstantType | undefined | null = null
  #transition = $state.raw<Transition | undefined>(undefined)

  #attachments = new RootAttachments<TooltipAttachment>('Tooltip', (attachment) => {
    this.#attached = attachment?.options ?? null
    this.#transition = attachment?.transition
    if (attachment) return
    this.payload = undefined
    this.triggerElement = null
  })

  #options: Partial<TooltipRootOptions> = $derived(this.#attached?.() ?? {})
  attached = $derived(this.#attached != null)
  #openState = $derived(this.#options.open ?? false)
  floatingId = $derived(this.#options.floatingId)
  disabled = $derived(this.#options.disabled ?? false)
  disableHoverablePopup = $derived(this.#options.disableHoverablePopup ?? false)
  trackCursorAxis = $derived(this.#options.trackCursorAxis ?? 'none')
  onOpenChangeComplete = $derived(this.#options.onOpenChangeComplete)
  activeTriggerId = $derived(this.#options.triggerId ?? null)

  setActiveTriggerId = (next: string | null): void => {
    this.#options.setTriggerId?.(next)
    this.activeTriggerId = this.#options.triggerId ?? next
  }

  open = $derived(this.disabled ? false : this.#openState)

  mounted = $derived(this.#transition?.mounted ?? false)
  transitionStatus = $derived(this.#transition?.status)

  domReferenceElement = $derived(this.triggerElement)
  floatingElement = $derived(this.popupElement)

  applyTriggerBindings = (bindings: TooltipTriggerBindings): void => {
    this.payload = bindings.payload as Payload | undefined
    this.closeDelay = bindings.closeDelay
    this.closeOnClick = bindings.closeOnClick
  }

  #applyTriggerBindingsById = (id: string | null): void => {
    if (!id) return
    const bindings = this.triggerElements.getTriggerBindingsById(id)
    if (bindings) this.applyTriggerBindings(bindings)
  }

  #triggerSelection: ActiveTriggerSelection = {
    setActiveTriggerId: this.setActiveTriggerId,
    setTriggerElement: (element) => (this.triggerElement = element),
    applyTriggerBindings: this.#applyTriggerBindingsById
  }

  setOpen = (
    next: boolean,
    reason?: TooltipOpenReason,
    event?: Event,
    trigger?: HTMLElement | null
  ): boolean => {
    const attached = this.#attached
    if (!attached) return false
    if (this.disabled && next) return false

    this.#options.onOpenChange?.(next)

    if (!next || !this.open || (event != null && isClickLikeEvent(event.type))) {
      this.data.openEvent = next ? event : undefined
    }
    if (next) {
      this.openedByMouseEvent = event == null || 'clientX' in event
    }
    dispatchOpenChange(this.data, next, reason)

    this.#openState = next
    this.#options.setOpen?.(next)
    this.#openState = attached().open
    this.openChangeReason = reason ?? null

    if (next && reason === REASONS.triggerFocus) {
      this.instantType = 'focus'
    } else if (!next && (reason === REASONS.triggerPress || reason === REASONS.escapeKey)) {
      this.instantType = 'dismiss'
    } else if (reason === REASONS.triggerHover) {
      this.instantType = undefined
    }

    selectActiveTrigger(this.#triggerSelection, next, trigger)

    return this.open === next
  }

  cancelPendingOpen = (): void => {
    dispatchOpenChange(this.data, false, REASONS.triggerPress)
  }

  setCursorPosition = (x: number, y: number): void => {
    this.cursorX = x
    this.cursorY = y
  }

  attach = (options: () => TooltipRootOptions): void => {
    this.#attached = options

    detachedTriggerSelectionById(() => ({
      ...this.#triggerSelection,
      triggerElements: this.triggerElements,
      triggerId: this.activeTriggerId,
      open: this.open,
      activeTriggerId: this.activeTriggerId,
      triggerElement: this.triggerElement,
      closeOnActiveTriggerUnmount: () => this.setOpen(false, REASONS.none)
    }))

    const transition = new Transition(() => ({ open: this.open }))
    this.#transition = transition

    const detach = this.#attachments.add({ options, transition })
    $effect(() => detach)

    $effect.pre(() => {
      const status = this.transitionStatus
      const isInstantPhase = this.isInstantPhase
      const reason = this.openChangeReason
      const currentInstantType = this.instantType

      if (
        (status === 'ending' && reason === REASONS.none) ||
        (status !== 'ending' && isInstantPhase)
      ) {
        if (currentInstantType !== 'delay') {
          this.#previousInstantType = currentInstantType
        }
        this.instantType = 'delay'
      } else if (this.#previousInstantType !== null) {
        this.instantType = this.#previousInstantType
        this.#previousInstantType = null
      }
    })

    $effect.pre(() => {
      if (this.#openState && this.disabled) {
        this.setOpen(false, REASONS.disabled)
      }
    })

    $effect.pre(() => {
      if (this.open && this.activeTriggerId == null) {
        this.payload = undefined
      }
    })

    dismiss(() => ({
      open: this.open,
      onClose: (reason, event) => this.setOpen(false, reason, event),
      enabled: !this.disabled,
      triggerPress: this.closeOnClick,
      popupElement: this.popupElement,
      referenceElement: this.domReferenceElement,
      isInsideElement: (target) => this.triggerElements.containsNode(target)
    }))

    openChangeCompleteClose(() => ({
      open: this.open,
      element: this.popupElement,
      transition,
      onOpenChangeComplete: this.onOpenChangeComplete,
      onClosed: () => {
        this.setActiveTriggerId(null)
      }
    }))
  }
}
