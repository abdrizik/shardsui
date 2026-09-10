import { RootAttachments } from '$lib/internal/detached-handle'
import {
  detachedTriggerSelectionById,
  selectActiveTrigger,
  type ActiveTriggerSelection
} from '$lib/internal/detached-trigger-selection.svelte'
import { isClickLikeEvent } from '$lib/internal/floating/event'
import { attachFloatingNode, type FloatingTree } from '$lib/internal/floating/floating-tree.svelte'
import { dispatchOpenChange } from '$lib/internal/floating/hover/interaction.svelte'
import type { InlineRectCoords } from '$lib/internal/floating/inline-rect'
import type { FloatingContextData } from '$lib/internal/floating/types'
import { openChangeCompleteClose } from '$lib/internal/open-change-complete.svelte'
import { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { REASONS } from '$lib/internal/reasons'
import { Transition } from '$lib/internal/transition-status.svelte'
import type { PreviewCardOpenReason } from './context'

type PreviewCardAttachment = {
  options: () => PreviewCardRootOptions
  transition: Transition
}

export const OPEN_DELAY = 600
export const CLOSE_DELAY = 300

type PreviewCardRootOptions = {
  open: boolean
  setOpen: (open: boolean) => void
  onOpenChange: ((open: boolean) => void) | undefined
  onOpenChangeComplete: ((open: boolean) => void) | undefined
  triggerId: string | null
  setTriggerId: (triggerId: string | null) => void
}

type PreviewCardTriggerBindings = {
  payload: unknown
  closeDelay: number
}

export type PreviewCardInstantType = 'dismiss' | 'focus'

export class PreviewCardRoot<Payload = unknown> {
  triggerElement = $state<HTMLElement | null>(null)
  popupElement = $state<HTMLElement | null>(null)
  positionerElement = $state<HTMLElement | null>(null)
  payload = $state.raw<Payload | undefined>(undefined)
  instantType = $state<PreviewCardInstantType | undefined>(undefined)
  closeDelay = $state(CLOSE_DELAY)
  openChangeReason = $state<PreviewCardOpenReason | null>(null)
  hasViewport = $state(false)
  inlineRectCoords: InlineRectCoords | undefined = undefined

  floatingTree: FloatingTree | undefined = undefined
  floatingNodeId: string | undefined = undefined

  data: FloatingContextData = {}
  triggerElements = new PopupTriggerMap<PreviewCardTriggerBindings>()

  #attached = $state.raw<(() => PreviewCardRootOptions) | null>(null)
  #transition = $state.raw<Transition | undefined>(undefined)

  #attachments = new RootAttachments<PreviewCardAttachment>('PreviewCard', (attachment) => {
    this.#attached = attachment?.options ?? null
    this.#transition = attachment?.transition
    if (attachment) return
    this.payload = undefined
    this.triggerElement = null
  })

  #options: Partial<PreviewCardRootOptions> = $derived(this.#attached?.() ?? {})
  attached = $derived(this.#attached != null)
  open = $derived(this.#options.open ?? false)
  onOpenChangeComplete = $derived(this.#options.onOpenChangeComplete)
  activeTriggerId = $derived(this.#options.triggerId ?? null)

  setActiveTriggerId = (next: string | null): void => {
    this.#options.setTriggerId?.(next)
    this.activeTriggerId = this.#options.triggerId ?? next
  }

  mounted = $derived(this.#transition?.mounted ?? false)
  transitionStatus = $derived(this.#transition?.status)

  domReferenceElement = $derived(this.triggerElement)
  floatingElement = $derived(this.popupElement)

  applyTriggerBindings = (bindings: PreviewCardTriggerBindings): void => {
    this.payload = bindings.payload as Payload | undefined
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
    reason?: PreviewCardOpenReason,
    event?: Event,
    trigger?: HTMLElement | null
  ): boolean => {
    const attached = this.#attached
    if (!attached) return false

    this.#options.onOpenChange?.(next)

    if (!next || !this.open || (event != null && isClickLikeEvent(event.type))) {
      this.data.openEvent = next ? event : undefined
    }
    dispatchOpenChange(this.data, next, reason)

    this.#options.setOpen?.(next)
    this.open = attached().open

    this.openChangeReason = reason ?? null

    const isFocusOpen = next && reason === REASONS.triggerFocus
    const isDismissClose =
      !next && (reason === REASONS.triggerPress || reason === REASONS.escapeKey)

    if (isFocusOpen) {
      this.instantType = 'focus'
    } else if (isDismissClose) {
      this.instantType = 'dismiss'
    } else if (reason === REASONS.triggerHover) {
      this.instantType = undefined
    }

    selectActiveTrigger(this.#triggerSelection, next, trigger)

    return this.open === next
  }

  containsTrigger = (target: Node): boolean => {
    return this.triggerElements.containsNode(target)
  }

  attach = (options: () => PreviewCardRootOptions): void => {
    this.#attached = options

    const floatingNode = attachFloatingNode({
      open: () => this.open,
      floating: () => this.popupElement
    })
    this.floatingTree = floatingNode.tree
    this.floatingNodeId = floatingNode.nodeId

    const transition = new Transition(() => ({ open: this.open }))
    this.#transition = transition

    const detach = this.#attachments.add({ options, transition })
    $effect(() => detach)

    openChangeCompleteClose(() => ({
      open: this.open,
      element: this.popupElement,
      transition,
      onOpenChangeComplete: this.onOpenChangeComplete,
      onClosed: () => {
        this.inlineRectCoords = undefined
        this.setActiveTriggerId(null)
      }
    }))

    detachedTriggerSelectionById(() => ({
      ...this.#triggerSelection,
      triggerElements: this.triggerElements,
      triggerId: this.activeTriggerId,
      open: this.open,
      activeTriggerId: this.activeTriggerId,
      triggerElement: this.triggerElement,
      closeOnActiveTriggerUnmount: () => this.setOpen(false, REASONS.none)
    }))

    $effect.pre(() => {
      if (this.open && this.activeTriggerId == null) {
        this.payload = undefined
      }
    })
  }
}
