import { contains } from '$lib/internal/dom'
import { isClickLikeEvent } from '$lib/internal/floating/event'
import {
  attachFloatingNode,
  getNodeChildren,
  type FloatingTree
} from '$lib/internal/floating/floating-tree.svelte'
import { dispatchOpenChange } from '$lib/internal/floating/hover/interaction.svelte'
import type { FloatingContextData } from '$lib/internal/floating/types'
import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
import { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { REASONS } from '$lib/internal/reasons'
import { Transition } from '$lib/internal/transition-status.svelte'
import { watch } from '$lib/internal/watch.svelte'
import { untrack } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
import { createPopupSizing } from './popup-sizing.svelte'

export type ActivationDirection = 'left' | 'right' | 'up' | 'down' | null

export type ContentStatus = 'starting' | 'idle' | 'ending'

type CloseReason =
  | typeof REASONS.triggerPress
  | typeof REASONS.triggerHover
  | typeof REASONS.outsidePress
  | typeof REASONS.listNavigation
  | typeof REASONS.focusOut
  | typeof REASONS.escapeKey
  | typeof REASONS.linkPress

const BLOCKED_RETURN_FOCUS_REASONS = new Set<CloseReason>([
  REASONS.triggerHover,
  REASONS.outsidePress,
  REASONS.focusOut
])

type NavigationMenuRootOptions = {
  value: unknown
  setValue: (value: unknown) => void
  delay: number
  closeDelay: number
  orientation: 'horizontal' | 'vertical'
  onValueChange?: (value: unknown) => void
  onOpenChangeComplete?: (open: boolean) => void
  parentRoot: NavigationMenuRoot | undefined
  ref: HTMLElement | null
}

export class NavigationMenuRoot {
  #options: () => NavigationMenuRootOptions

  data: FloatingContextData = {}
  triggerElements = new PopupTriggerMap()

  activeTriggerElement = $state<HTMLElement | null>(null)
  prevTriggerElement = $state<HTMLElement | null>(null)
  popupElement = $state<HTMLElement | null>(null)
  positionerElement = $state<HTMLElement | null>(null)
  viewportElement = $state<HTMLElement | null>(null)
  viewportTargetElement = $state<HTMLElement | null>(null)
  viewportInert = $state(false)
  currentContentElement = $state<HTMLElement | null>(null)

  beforeOutsideElement = $state<HTMLSpanElement | null>(null)
  afterOutsideElement = $state<HTMLSpanElement | null>(null)
  beforeInsideElement = $state<HTMLSpanElement | null>(null)
  afterInsideElement = $state<HTMLSpanElement | null>(null)

  #activationDirection = $state<ActivationDirection>(null)
  #closeReason: CloseReason | undefined

  #triggers = new SvelteMap<unknown, HTMLElement>()

  #transition: Transition
  readonly sizing: ReturnType<typeof createPopupSizing>
  readonly floatingTree: FloatingTree
  readonly floatingNodeId: string
  readonly floatingParentNodeId: string | null

  rootElement = $derived.by(() => this.#options().ref)
  value = $derived.by(() => this.#options().value)
  delay = $derived.by(() => this.#options().delay)
  closeDelay = $derived.by(() => this.#options().closeDelay)
  orientation = $derived.by(() => this.#options().orientation)
  parentRoot = $derived.by(() => this.#options().parentRoot)

  mounted = $derived.by(() => this.#transition.mounted)
  transitionStatus = $derived.by(() => this.#transition.status)

  open = $derived(this.value != null)
  nested = $derived(this.parentRoot != null)

  domReferenceElement = $derived(this.activeTriggerElement)
  floatingElement = $derived(this.positionerElement ?? this.viewportElement)

  interactionsEnabled = $derived(this.positionerElement != null || this.value == null)
  hoverInteractionsEnabled = $derived(this.floatingElement != null || this.value == null)

  constructor(options: () => NavigationMenuRootOptions) {
    this.#options = options

    this.#transition = new Transition(() => ({ open: this.open }))

    openChangeComplete(() => ({
      open: this.open,
      element: this.popupElement,
      onComplete: () => {
        if (!this.open) this.#returnFocusToTrigger()
      }
    }))

    openChangeComplete(() => ({
      open: this.open,
      element: this.viewportTargetElement,
      onComplete: () => {
        if (!this.open) this.#returnFocusToTrigger()
      }
    }))

    const floatingNode = attachFloatingNode({
      open: () => this.positionerElement != null && this.open,
      floating: () => this.floatingElement
    })
    this.floatingTree = floatingNode.tree
    this.floatingNodeId = floatingNode.nodeId
    this.floatingParentNodeId = floatingNode.parentNodeId

    watch(
      () => this.value,
      () => {
        this.viewportInert = false
      }
    )

    $effect(() => {
      if (this.value == null) {
        this.activeTriggerElement = null
        return
      }
      const el = this.#triggers.get(this.value)
      if (el) {
        this.activeTriggerElement = el
      }
    })

    this.sizing = createPopupSizing(() => ({
      popupElement: this.popupElement,
      positionerElement: this.positionerElement,
      currentContentElement: this.currentContentElement,
      value: this.value,
      mounted: this.mounted,
      transitionStatus: this.transitionStatus
    }))
  }

  get activationDirection(): ActivationDirection {
    return this.open ? this.#activationDirection : null
  }

  set activationDirection(next: ActivationDirection) {
    this.#activationDirection = next
  }

  #resolveTriggerValue(trigger: HTMLElement | null | undefined): unknown {
    if (!trigger) return undefined
    for (const [itemValue, el] of this.#triggers) {
      if (el.contains(trigger)) return itemValue
    }
    return undefined
  }

  containsTrigger = (node: Node | null | undefined): boolean => {
    if (this.triggerElements.containsNode(node)) return true
    return this.parentRoot?.containsTrigger(node) ?? false
  }

  closeOnFocusOut = (element: Element | null, event: FocusEvent): void => {
    const popupElement = this.popupElement
    if (!this.positionerElement || !popupElement) return

    const relatedTarget = event.relatedTarget as Element | null
    const nodeChildrenContains = getNodeChildren(this.floatingTree.nodes, this.floatingNodeId).some(
      (node) => contains(node.floating, relatedTarget)
    )

    if (
      !contains(popupElement, element) &&
      !contains(popupElement, relatedTarget) &&
      !contains(this.rootElement, relatedTarget) &&
      !nodeChildrenContains
    ) {
      this.setValue(null, REASONS.focusOut, event)
    }
  }

  #returnFocusToTrigger(): void {
    if (!this.#isReturnFocusBlocked() && this.prevTriggerElement && this.popupElement) {
      const activeEl = (this.rootElement?.ownerDocument ?? document).activeElement
      if (
        contains(this.popupElement, activeEl) ||
        activeEl === this.popupElement.ownerDocument.body
      ) {
        this.prevTriggerElement.focus({ preventScroll: true })
        this.prevTriggerElement = null
      }
    }

    this.#transition.mounted = false
    this.#options().onOpenChangeComplete?.(false)
    this.activationDirection = null
    this.currentContentElement = null
    this.#closeReason = undefined
  }

  #isReturnFocusBlocked(): boolean {
    return this.#closeReason ? BLOCKED_RETURN_FOCUS_REASONS.has(this.#closeReason) : false
  }

  setOpen = (
    nextOpen: boolean,
    reason?: string,
    event?: Event,
    trigger?: HTMLElement | null
  ): void => {
    if (this.positionerElement == null && this.value != null) return

    if (!nextOpen && this.value == null) return
    if (!nextOpen && trigger != null && this.value !== this.#resolveTriggerValue(trigger)) return

    const wasOpen = this.open

    if (!nextOpen || !wasOpen || (event != null && isClickLikeEvent(event.type))) {
      this.data.openEvent = nextOpen ? event : undefined
    }
    if (nextOpen !== wasOpen) {
      dispatchOpenChange(this.data, nextOpen, reason)
    }

    if (nextOpen) {
      const itemValue = this.#resolveTriggerValue(trigger)
      if (itemValue !== undefined) this.setValue(itemValue, reason as CloseReason, event)
    } else {
      this.setValue(null, reason as CloseReason, event)
    }
  }

  setValue = (next: unknown, reason?: CloseReason, event?: Event): void => {
    if (next == null) {
      this.#closeReason = reason
    }

    if (next !== this.value) {
      this.#options().onValueChange?.(next)
    }

    if (next == null) {
      this.activationDirection = null
    }

    this.#options().setValue(next)

    const parentRoot = this.parentRoot
    if (parentRoot && next == null && reason === REASONS.linkPress) {
      parentRoot.setValue(null, reason, event)
    }
  }

  registerTrigger = (itemValue: unknown, id: string, element: HTMLElement): (() => void) => {
    this.#triggers.set(itemValue, element)
    const unregister = this.triggerElements.add(id, element)
    untrack(() => {
      if (this.value != null && itemValue === this.value) {
        this.activeTriggerElement = element
      }
    })
    return () => {
      if (this.#triggers.get(itemValue) === element) {
        this.#triggers.delete(itemValue)
      }
      unregister()
    }
  }
}
