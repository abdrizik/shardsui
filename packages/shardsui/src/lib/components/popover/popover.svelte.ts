import { PATIENT_CLICK_THRESHOLD } from '$lib/internal/constants'
import { RootAttachments } from '$lib/internal/detached-handle'
import {
  detachedTriggerSelectionById,
  selectActiveTrigger,
  type ActiveTriggerSelection
} from '$lib/internal/detached-trigger-selection.svelte'
import { isClickLikeEvent } from '$lib/internal/floating/event'
import { attachFloatingNode, type FloatingTree } from '$lib/internal/floating/floating-tree.svelte'
import { dispatchOpenChange } from '$lib/internal/floating/hover/interaction.svelte'
import type { FloatingContextData } from '$lib/internal/floating/types'
import { openChangeCompleteClose } from '$lib/internal/open-change-complete.svelte'
import { OpenInteractionHandlers } from '$lib/internal/open-interaction-handlers.svelte'
import { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { REASONS } from '$lib/internal/reasons'
import { Timeout } from '$lib/internal/timeout'
import { Transition } from '$lib/internal/transition-status.svelte'
import type { PopoverOpenReason } from './context'

type PopoverAttachment = {
  options: () => PopoverRootOptions
  transition: Transition
  openInteraction: OpenInteractionHandlers
}

type PopoverRootOptions = {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean | 'trap-focus'
  onOpenChangeComplete: ((open: boolean) => void) | undefined
  triggerId: string | null
  setTriggerId: (triggerId: string | null) => void
}

type PopoverTriggerBindings = {
  payload: unknown
  disabled: boolean
  openOnHover: boolean
  closeDelay: number
}

export type PopoverInstantType = 'click' | 'dismiss' | 'focus' | 'trigger-change'

export class PopoverRoot<Payload = unknown> {
  triggerElement = $state<HTMLElement | null>(null)
  popupElement = $state<HTMLElement | null>(null)
  positionerElement = $state<HTMLElement | null>(null)
  triggerFocusTargetElement = $state<HTMLElement | null>(null)
  popupId = $state<string | undefined>(undefined)
  titleId = $state<string | undefined>(undefined)
  descriptionId = $state<string | undefined>(undefined)
  payload = $state.raw<Payload | undefined>(undefined)

  openChangeReason = $state<PopoverOpenReason | null>(null)
  instantType = $state<PopoverInstantType | undefined>(undefined)
  closePartCount = $state(0)
  stickIfOpen = true
  triggerDisabled = $state(false)
  openOnHover = $state(false)
  closeDelay = $state(0)
  hasViewport = $state(false)

  floatingTree: FloatingTree | undefined = undefined
  floatingNodeId: string | undefined = undefined

  data: FloatingContextData = {}
  triggerElements = new PopupTriggerMap<PopoverTriggerBindings>()
  #stickIfOpenTimeout = new Timeout()

  #attached = $state.raw<(() => PopoverRootOptions) | null>(null)

  #transition = $state.raw<Transition | undefined>(undefined)
  #openInteraction = $state.raw<OpenInteractionHandlers | undefined>(undefined)

  #attachments = new RootAttachments<PopoverAttachment>('Popover', (attachment) => {
    this.#attached = attachment?.options ?? null
    this.#transition = attachment?.transition
    this.#openInteraction = attachment?.openInteraction
    if (attachment) return
    this.payload = undefined
    this.triggerElement = null
  })

  #options: Partial<PopoverRootOptions> = $derived(this.#attached?.() ?? {})

  attached = $derived(this.#attached != null)
  open = $derived(this.#options.open ?? false)
  modal = $derived(this.#options.modal ?? false)
  onOpenChangeComplete = $derived(this.#options.onOpenChangeComplete)
  activeTriggerId = $derived(this.#options.triggerId ?? null)

  setActiveTriggerId = (next: string | null): void => {
    this.#options.setTriggerId?.(next)
    this.activeTriggerId = this.#options.triggerId ?? next
  }

  openMethod = $derived(this.#openInteraction?.openMethod ?? null)
  openInteractionHandlers = $derived(this.#openInteraction)

  domReferenceElement = $derived(this.triggerElement)
  floatingElement = $derived(this.positionerElement)

  mounted = $derived(this.#transition?.mounted ?? false)
  transitionStatus = $derived(this.#transition?.status)

  focusManagerModal = $derived(this.modal !== false && this.closePartCount > 0)

  applyTriggerBindings = (bindings: PopoverTriggerBindings): void => {
    this.payload = bindings.payload as Payload | undefined
    this.triggerDisabled = bindings.disabled
    this.openOnHover = bindings.openOnHover
    this.closeDelay = bindings.closeDelay
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
    reason?: PopoverOpenReason,
    event?: Event,
    trigger?: HTMLElement | null
  ): void => {
    const attached = this.#attached
    if (!attached) return

    if (!next || !this.open || (event != null && isClickLikeEvent(event.type))) {
      this.data.openEvent = next ? event : undefined
    }
    dispatchOpenChange(this.data, next, reason)

    if (reason === REASONS.triggerHover) {
      this.stickIfOpen = true
      this.#stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
        this.stickIfOpen = false
      })
    }

    this.open = next
    this.#options.setOpen?.(next)
    this.open = attached().open

    this.openChangeReason = reason ?? null

    selectActiveTrigger(this.#triggerSelection, next, trigger)

    if (reason === REASONS.triggerPress) {
      this.instantType = event instanceof UIEvent && event.detail === 0 ? 'click' : undefined
    } else if (!next && (reason === REASONS.escapeKey || reason == null)) {
      this.instantType = 'dismiss'
    } else if (reason === REASONS.focusOut) {
      this.instantType = 'focus'
    } else {
      this.instantType = undefined
    }
  }

  containsTrigger = (target: Node): boolean => {
    return this.triggerElements.containsNode(target)
  }

  attach = (options: () => PopoverRootOptions): void => {
    const openInteraction = new OpenInteractionHandlers(() => ({ open: this.open }))
    this.#openInteraction = openInteraction

    this.#attached = options

    detachedTriggerSelectionById(() => ({
      ...this.#triggerSelection,
      triggerElements: this.triggerElements,
      triggerId: this.activeTriggerId,
      open: this.open,
      activeTriggerId: this.activeTriggerId,
      triggerElement: this.triggerElement
    }))

    const transition = new Transition(() => ({ open: this.open }))
    this.#transition = transition

    const detach = this.#attachments.add({ options, transition, openInteraction })
    $effect(() => detach)

    $effect(() => {
      if (!this.open) this.#stickIfOpenTimeout.clear()
    })

    openChangeCompleteClose(() => ({
      open: this.open,
      element: this.popupElement,
      transition,
      onOpenChangeComplete: this.onOpenChangeComplete,
      onClosed: () => {
        this.stickIfOpen = true
        this.openChangeReason = null
        this.setActiveTriggerId(null)
      }
    }))

    const floatingNode = attachFloatingNode({
      open: () => this.open,
      floating: () => this.positionerElement
    })
    this.floatingTree = floatingNode.tree
    this.floatingNodeId = floatingNode.nodeId

    $effect(this.#stickIfOpenTimeout.disposeEffect)
  }
}
