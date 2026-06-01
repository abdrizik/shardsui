import { dataAttrs } from '$lib/internal/data-attrs'
import { RootAttachments } from '$lib/internal/detached-handle'
import { attachFloatingNode } from '$lib/internal/floating/floating-tree.svelte'
import { openChangeCompleteClose } from '$lib/internal/open-change-complete.svelte'
import { OpenInteractionHandlers } from '$lib/internal/open-interaction-handlers.svelte'
import { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { Transition } from '$lib/internal/transition-status.svelte'
import { untrack } from 'svelte'
import { DialogContext, type DialogOpenReason, type DialogRole } from './context'

type DialogRootOptions = {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean | 'trap-focus'
  disablePointerDismissal: boolean
  role?: DialogRole
  isDrawer?: boolean
  detachedRoot?: DialogRoot | undefined
  onOpenChangeComplete: ((open: boolean) => void) | undefined
  triggerId: string | null
  setTriggerId: (triggerId: string | null) => void
}

type DialogAttachment = {
  options: () => DialogRootOptions
  transition: Transition
  openInteraction: OpenInteractionHandlers
}

export class DialogRoot<Payload = unknown> {
  triggerElement = $state<HTMLElement | null>(null)
  popupElement = $state<HTMLElement | null>(null)
  backdropElement = $state<HTMLElement | null>(null)
  internalBackdropElement = $state<HTMLElement | null>(null)
  viewportElement = $state<HTMLElement | null>(null)
  popupId = $state<string | undefined>(undefined)
  titleId = $state<string | undefined>(undefined)
  descriptionId = $state<string | undefined>(undefined)
  payload = $state.raw<Payload | undefined>(undefined)

  nestedOpenCount = $state(0)
  nestedOpenDrawerCount = $state(0)

  outsidePressEnabled = $state(true)
  nested = $state(false)

  openChangeReason = $state.raw<DialogOpenReason | null>(null)
  lastCloseEvent = $state.raw<Event | null>(null)

  readonly triggerElements = new PopupTriggerMap()

  #attached = $state.raw<(() => DialogRootOptions) | null>(null)
  #transition = $state.raw<Transition | undefined>(undefined)
  #openInteraction = $state.raw<OpenInteractionHandlers | undefined>(undefined)
  #redirect = $state.raw<DialogRoot<Payload> | null>(null)

  #attachments = new RootAttachments<DialogAttachment>('Dialog', (attachment) => {
    this.#attached = attachment?.options ?? null
    this.#transition = attachment?.transition
    this.#openInteraction = attachment?.openInteraction
    if (attachment) return
    this.payload = undefined
    this.triggerElement = null
  })

  #options: Partial<DialogRootOptions> = $derived(this.#attached?.() ?? {})

  attached = $derived(this.#attached != null)
  open = $derived(this.#options.open ?? false)
  modal = $derived(this.#options.modal ?? true)
  disablePointerDismissal = $derived(this.#options.disablePointerDismissal ?? false)
  role = $derived(this.#options.role ?? 'dialog')
  onOpenChangeComplete = $derived(this.#options.onOpenChangeComplete)
  activeTriggerId = $derived(this.#options.triggerId ?? null)

  openMethod = $derived(this.#openInteraction?.openMethod ?? null)
  openInteractionHandlers = $derived(this.#openInteraction)

  mounted = $derived(this.#transition?.mounted ?? false)
  transitionStatus = $derived(this.#transition?.status)

  transitionAttrs = $derived(
    dataAttrs({
      open: this.open,
      closed: !this.open,
      'starting-style': this.transitionStatus === 'starting',
      'ending-style': this.transitionStatus === 'ending'
    })
  )
  nestedAttrs = $derived(
    dataAttrs({
      nested: this.nested,
      'nested-dialog-open': this.nestedOpenCount > 0
    })
  )

  activeTrigger: HTMLElement | null = $derived(this.mounted ? this.triggerElement : null)

  setActiveTriggerId = (next: string | null): void => {
    this.#options.setTriggerId?.(next)
    this.activeTriggerId = this.#options.triggerId ?? next
  }

  get current(): DialogRoot<Payload> {
    return this.#redirect ?? this
  }

  // Declared as a method, not an arrow field: `strictFunctionTypes` makes property-declared
  // parameters contravariant, which would stop `DialogRoot<Payload>` satisfying `DialogRoot<unknown>`.
  follow(target: DialogRoot<Payload>): void {
    if (target !== this) this.#redirect = target
  }

  registerTrigger = (id: string, element: HTMLElement): (() => void) => {
    return this.triggerElements.add(id, element)
  }

  containsTrigger = (target: Node): boolean => {
    return this.triggerElements.containsNode(target)
  }

  setOpen = (next: boolean, reason?: DialogOpenReason, event?: Event): void => {
    const attached = this.#attached
    if (!attached) return
    this.openChangeReason = reason ?? null
    this.lastCloseEvent = next ? null : (event ?? null)
    this.#options.setOpen?.(next)
    this.open = attached().open
    if (next) this.setActiveTriggerId(this.triggerElement?.id ?? null)
  }

  attach = (options: () => DialogRootOptions): void => {
    this.#attached = options

    const detachedRoot = $derived(options().detachedRoot)
    $effect.pre(() => {
      detachedRoot?.follow(this)
    })

    const parent = DialogContext.getOr()
    const isDrawer = options().isDrawer ?? false

    this.nested = Boolean(parent)

    const openInteraction = new OpenInteractionHandlers(() => ({ open: this.open }))
    this.#openInteraction = openInteraction

    const transition = new Transition(() => ({ open: this.open }))
    this.#transition = transition

    const detach = this.#attachments.add({ options, transition, openInteraction })
    $effect(() => detach)

    $effect(() => {
      if (!parent) return
      const currentOpen = this.open
      if (!currentOpen && !this.mounted) return
      if (currentOpen) {
        parent.nestedOpenCount = this.nestedOpenCount + 1
        parent.nestedOpenDrawerCount = this.nestedOpenDrawerCount + (isDrawer ? 1 : 0)
      } else {
        parent.nestedOpenCount = 0
        parent.nestedOpenDrawerCount = 0
      }
      return () => {
        if (currentOpen) {
          parent.nestedOpenCount = 0
          parent.nestedOpenDrawerCount = 0
        }
      }
    })

    $effect(() => {
      if (!this.open || this.activeTriggerId != null || this.triggerElements.size !== 1) return
      const [[triggerId, element]] = this.triggerElements.entries()
      untrack(() => {
        this.setActiveTriggerId(triggerId)
        this.triggerElement = element
      })
    })

    openChangeCompleteClose(() => ({
      open: this.open,
      element: this.popupElement,
      transition,
      onOpenChangeComplete: this.onOpenChangeComplete,
      onClosed: () => {
        this.setActiveTriggerId(null)
      }
    }))

    attachFloatingNode({
      open: () => this.open,
      floating: () => this.popupElement
    })
  }
}
