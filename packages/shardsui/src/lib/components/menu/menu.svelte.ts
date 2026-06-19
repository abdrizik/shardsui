import type { ContextMenuRoot } from '$lib/components/context-menu/context'
import { ContextMenuContext } from '$lib/components/context-menu/context'
import { MenubarContext } from '$lib/components/menubar/context'
import type { MenubarRoot } from '$lib/components/menubar/menubar.svelte'
import { RootAttachments } from '$lib/internal/detached-handle'
import { detachedTriggerSelection } from '$lib/internal/detached-trigger-selection.svelte'
import { isClickLikeEvent } from '$lib/internal/floating/event'
import {
  FloatingNodeContext,
  FloatingTree,
  FloatingTreeContext,
  nextFloatingId,
  registerFloatingNode,
  type FloatingNodeContextValue
} from '$lib/internal/floating/floating-tree.svelte'
import { dispatchOpenChange } from '$lib/internal/floating/hover/interaction.svelte'
import type { FloatingContextData } from '$lib/internal/floating/types'
import { openChangeCompleteClose } from '$lib/internal/open-change-complete.svelte'
import { OpenInteractionHandlers } from '$lib/internal/open-interaction-handlers.svelte'
import { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { REASONS } from '$lib/internal/reasons'
import { Timeout } from '$lib/internal/timeout'
import { Transition } from '$lib/internal/transition-status.svelte'
import { untrack } from 'svelte'
import {
  MenuContext,
  MenuSubmenuContext,
  type MenuInstantType,
  type MenuOpenChangeReason,
  type MenuTreeEvents
} from './context'
import { MenuItemRegistry } from './item-registry.svelte'

// A `mousedown`-based outside press fires right after a long press opens a context menu, so the
// dismissal is ignored until the gesture is certainly over.
const OUTSIDE_PRESS_GRACE_MS = 500
// Mobile browsers can dispatch `focus` before the `click` of the same tap; the focus-opened menu
// must not be closed by that trailing click.
const TOUCH_CLOSE_GRACE_MS = 300

type MenuRootOptions = {
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
  modal: boolean
  loopFocus: boolean
  orientation: 'horizontal' | 'vertical'
  closeParentOnEsc: boolean
  highlightItemOnHover: boolean
  onOpenChange: ((open: boolean) => void) | undefined
  onOpenChangeComplete: ((open: boolean) => void) | undefined
  triggerId: string | null
  setTriggerId: (triggerId: string | null) => void
  ownId: string
}

export class MenuRoot<Payload = unknown> {
  #triggerElement = $state<HTMLElement | null>(null)

  get triggerElement(): HTMLElement | null {
    return this.#triggerElement
  }

  set triggerElement(element: HTMLElement | null) {
    this.#triggerElement = element
    untrack(() => this.#options.setTriggerId?.(element?.id ?? null))
  }

  triggerFocusTargetElement = $state<HTMLSpanElement | null>(null)
  payload = $state.raw<Payload | undefined>(undefined)
  popupElement = $state<HTMLElement | null>(null)
  positionerElement = $state<HTMLElement | null>(null)
  internalBackdropElement = $state<HTMLElement | null>(null)
  backdropElement = $state<HTMLElement | null>(null)
  popupId = $state<string | undefined>(undefined)
  hoverEnabled = $state(true)
  allowMouseEnter = $state(false)
  pendingFocus = $state<'first' | 'last' | null>(null)
  hasViewport = $state(false)
  typing = $state(false)
  instantType = $state<MenuInstantType | undefined>(undefined)
  hoverCloseDelay = $state(0)
  openChangeReason = $state<MenuOpenChangeReason | null>(null)
  lastCloseEvent = $state<Event | null>(null)

  isPointerModality = true

  #allowMouseUpTrigger = $state(false)
  #keyboardEventRelay = $state<((event: KeyboardEvent) => void) | undefined>(undefined)

  #allowOutsidePressDismissal = true
  #outsidePressTimeout = new Timeout()
  #allowTouchToClose = true
  #touchCloseTimeout = new Timeout()

  parent: MenuRoot | undefined = undefined
  parentType = $state<'menu' | 'menubar' | 'context-menu' | undefined>(undefined)
  menubar = $state<MenubarRoot | undefined>(undefined)
  contextMenu: ContextMenuRoot | undefined = undefined
  insideContextMenu: ContextMenuRoot | undefined = undefined
  #ownTree = new FloatingTree<MenuTreeEvents>()
  #joinedTree = $state.raw<FloatingTree<MenuTreeEvents> | undefined>(undefined)
  #parentNode = $state.raw<FloatingNodeContextValue | undefined>(undefined)
  nodeId = $state('')
  providesFloatingTree = false
  tree = $derived(this.#joinedTree ?? this.#ownTree)
  parentNodeId = $derived(this.#joinedTree ? (this.#parentNode?.id ?? null) : null)

  data: FloatingContextData = {}
  triggerElements = new PopupTriggerMap()
  items = new MenuItemRegistry(() => ({ loopFocus: this.loopFocus, container: this.popupElement }))

  #attached = $state.raw<(() => MenuRootOptions) | null>(null)
  #attachments = new RootAttachments<() => MenuRootOptions>('Menu', (options) => {
    this.#attached = options
  })

  attached = $derived(this.#attached != null)

  #transition = $state.raw<Transition | undefined>(undefined)
  #openInteraction = $state.raw<OpenInteractionHandlers | undefined>(undefined)

  #options: Partial<MenuRootOptions> = $derived(this.#attached?.() ?? {})
  open = $derived(this.#options.open ?? false)
  #disabledOption = $derived(this.#options.disabled ?? false)
  loopFocus = $derived(this.#options.loopFocus ?? true)
  orientation = $derived(this.#options.orientation ?? 'vertical')
  closeParentOnEsc = $derived(this.#options.closeParentOnEsc ?? false)
  #modalOption = $derived(this.#options.modal ?? true)
  onOpenChangeComplete = $derived(this.#options.onOpenChangeComplete)

  rootId: string = $derived(
    this.parent ? this.parent.rootId : (this.menubar?.rootId ?? this.#options.ownId ?? '')
  )

  disabled = $derived(this.menubar?.disabled || this.#disabledOption)
  modal = $derived(
    (this.parentType === undefined || this.parentType === 'context-menu') && this.#modalOption
  )
  highlightItemOnHover = $derived(this.#options.highlightItemOnHover ?? true)

  openMethod = $derived(this.#openInteraction?.openMethod)
  openInteractionHandlers = $derived(this.#openInteraction)
  mounted = $derived(this.#transition?.mounted ?? false)
  transitionStatus = $derived(this.#transition?.status)
  domReferenceElement: Element | null = $derived(this.triggerElement)
  floatingElement: HTMLElement | null = $derived(this.positionerElement ?? this.popupElement)

  get keyboardEventRelay(): ((event: KeyboardEvent) => void) | undefined {
    if (this.#keyboardEventRelay) return this.#keyboardEventRelay
    if (this.parentType === 'menu') return this.parent?.keyboardEventRelay
    return undefined
  }
  set keyboardEventRelay(value: ((event: KeyboardEvent) => void) | undefined) {
    this.#keyboardEventRelay = value
  }

  get #mouseUpTriggerOwner(): { allowMouseUpTrigger: boolean } | undefined {
    return this.parent ?? this.contextMenu ?? this.menubar
  }

  get allowMouseUpTrigger(): boolean {
    return this.#mouseUpTriggerOwner?.allowMouseUpTrigger ?? this.#allowMouseUpTrigger
  }
  set allowMouseUpTrigger(value: boolean) {
    const owner = this.#mouseUpTriggerOwner
    if (owner) owner.allowMouseUpTrigger = value
    else this.#allowMouseUpTrigger = value
  }

  adoptTriggerContext = (context: {
    tree: FloatingTree<MenuTreeEvents> | undefined
    parentNode: FloatingNodeContextValue | undefined
    nodeId: string
    menubar: MenubarRoot | undefined
  }): void => {
    this.#joinedTree = context.tree
    this.#parentNode = context.parentNode
    this.nodeId = context.nodeId
    this.menubar = context.menubar
    this.parentType = context.menubar ? 'menubar' : undefined
  }

  containsTrigger = (target: Node): boolean => {
    return this.triggerElements.containsNode(target)
  }

  allowsOutsidePress = (): boolean => {
    if (this.parentType !== 'context-menu' || this.data.openEvent?.type === 'contextmenu') {
      return true
    }
    return this.#allowOutsidePressDismissal
  }

  openAndFocus = (
    which: 'first' | 'last',
    reason?: MenuOpenChangeReason,
    nativeEvent?: Event
  ): void => {
    this.pendingFocus = which
    this.setOpen(true, reason, nativeEvent)
  }

  setOpen = (
    next: boolean,
    reason?: MenuOpenChangeReason,
    nativeEvent?: Event,
    trigger?: HTMLElement | null
  ): void => {
    if (next && trigger) this.triggerElement = trigger

    if (!next && !this.open) return

    if (
      next === this.open &&
      trigger === this.triggerElement &&
      this.openChangeReason === (reason ?? null)
    ) {
      return
    }

    if (!next || !this.open || (nativeEvent != null && isClickLikeEvent(nativeEvent.type))) {
      this.data.openEvent = next ? nativeEvent : undefined
    }

    this.#options.onOpenChange?.(next)

    dispatchOpenChange(this.data, next, reason)

    if (
      !next &&
      nativeEvent?.type === 'click' &&
      (nativeEvent as PointerEvent).pointerType === 'touch' &&
      !this.#allowTouchToClose
    ) {
      return
    }

    if (next && reason === REASONS.triggerFocus) {
      this.#allowTouchToClose = false
      this.#touchCloseTimeout.start(TOUCH_CLOSE_GRACE_MS, () => {
        this.#allowTouchToClose = true
      })
    } else {
      this.#allowTouchToClose = true
      this.#touchCloseTimeout.clear()
    }

    this.open = next
    this.#options.setOpen?.(next)
    if (this.#attached) this.open = this.#attached().open

    this.openChangeReason = reason ?? null
    this.lastCloseEvent = next ? null : (nativeEvent ?? null)

    if (!next) {
      this.items.highlightedIndex = -1
      this.pendingFocus = null
      this.items.clearQueuedFocus()
    }

    this.instantType = this.#resolveInstantType(next, reason, nativeEvent)
  }

  #resolveInstantType(
    next: boolean,
    reason: MenuOpenChangeReason | undefined,
    nativeEvent: Event | undefined
  ): MenuInstantType | undefined {
    if (
      this.menubar &&
      (reason === REASONS.triggerFocus ||
        reason === REASONS.focusOut ||
        reason === REASONS.triggerHover ||
        reason === REASONS.listNavigation ||
        reason === REASONS.siblingOpen)
    ) {
      return 'group'
    }

    const isKeyboardClick =
      (reason === REASONS.triggerPress || reason === REASONS.itemPress) &&
      (nativeEvent as MouseEvent | undefined)?.detail === 0
    if (isKeyboardClick) return 'click'

    const isDismissClose = !next && (reason === REASONS.escapeKey || reason == null)
    if (isDismissClose) return 'dismiss'

    return undefined
  }

  attach = (options: () => MenuRootOptions): void => {
    this.#attached = options
    const detach = this.#attachments.add(options)
    $effect(() => detach)

    const parent = MenuContext.getOr()
    const isSubmenu = parent !== undefined && MenuSubmenuContext.getOr() === true
    const menubar = !isSubmenu ? MenubarContext.getOr() : undefined
    const insideContextMenu = ContextMenuContext.getOr()
    const contextMenu = !parent && !menubar ? insideContextMenu : undefined
    this.providesFloatingTree = !isSubmenu && !menubar

    if (isSubmenu || contextMenu) {
      this.parentType = isSubmenu ? 'menu' : 'context-menu'
      if (isSubmenu) {
        this.#joinedTree = FloatingTreeContext.getOr() as FloatingTree<MenuTreeEvents> | undefined
        this.#parentNode = FloatingNodeContext.getOr()
      }
      this.nodeId = nextFloatingId()
      registerFloatingNode<MenuTreeEvents>({
        tree: () => this.tree,
        id: () => this.nodeId,
        parentId: () => this.parentNodeId,
        open: () => this.open,
        floating: () => this.popupElement
      })
    }

    this.parent = isSubmenu ? parent : undefined
    this.contextMenu = contextMenu
    this.insideContextMenu = insideContextMenu

    this.#openInteraction = new OpenInteractionHandlers(() => ({ open: this.open }))

    const transition = new Transition(() => ({ open: this.open }))
    this.#transition = transition

    $effect(() => {
      if (!this.open && !this.hoverEnabled) this.hoverEnabled = true
    })

    $effect(this.#outsidePressTimeout.disposeEffect)
    $effect(this.#touchCloseTimeout.disposeEffect)

    this.items.observeContainer()

    $effect(() => {
      if (this.parentType !== 'context-menu') return
      if (!this.open) {
        this.#outsidePressTimeout.clear()
        this.#allowOutsidePressDismissal = false
        return
      }
      this.#outsidePressTimeout.start(OUTSIDE_PRESS_GRACE_MS, () => {
        this.#allowOutsidePressDismissal = true
      })
    })

    openChangeCompleteClose(() => ({
      open: this.open,
      element: this.popupElement,
      transition,
      onOpenChangeComplete: this.onOpenChangeComplete,
      onClosed: () => {
        this.allowMouseEnter = false
      }
    }))

    detachedTriggerSelection(() => ({
      triggerElements: this.triggerElements,
      triggerId: options().triggerId,
      open: this.open,
      triggerElement: this.triggerElement,
      setTriggerElement: (element) => (this.triggerElement = element)
    }))

    $effect(() => {
      if (!this.open || this.pendingFocus === null || this.items.count === 0) return
      const which = this.pendingFocus
      this.pendingFocus = null
      this.items.applyPendingFocus(which)
    })

    $effect(() => () => {
      this.items.clearQueuedFocus()
    })
  }
}
