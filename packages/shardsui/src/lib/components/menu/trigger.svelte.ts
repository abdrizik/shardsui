import type { MenubarRoot } from '$lib/components/menubar/menubar.svelte'
import { Button, type ButtonOptions } from '$lib/internal/button.svelte'
import { chain } from '$lib/internal/chain'
import { PATIENT_CLICK_THRESHOLD } from '$lib/internal/constants'
import { contains, getTarget } from '$lib/internal/dom'
import { makeEventPreventable } from '$lib/internal/event-preventable'
import { CompositeItem } from '$lib/internal/floating/composite.svelte'
import { matchesFocusVisible } from '$lib/internal/floating/element'
import {
  FloatingNodeContext,
  FloatingTreeContext,
  nextFloatingId,
  registerFloatingNode,
  type FloatingTree
} from '$lib/internal/floating/floating-tree.svelte'
import { hoverReferenceInteraction } from '$lib/internal/floating/hover/reference.svelte'
import { safePolygon } from '$lib/internal/floating/safe-polygon.svelte'
import { TriggerFocusGuards } from '$lib/internal/floating/trigger-focus-guards.svelte'
import { isMouseWithinBounds } from '$lib/internal/pseudo-element-bounds'
import { REASONS } from '$lib/internal/reasons'
import { Timeout } from '$lib/internal/timeout'
import { untrack } from 'svelte'
import { on } from 'svelte/events'
import type { MenuOpenChangeReason, MenuTreeEvents } from './context'
import { findRootOwnerId } from './find-root-owner-id'
import type { MenuRoot } from './menu.svelte'

// A press shorter than this is a plain click, not the start of a drag-release.
const MOUSE_UP_ARM_DELAY = 200

type MenuTriggerOptions<Payload = unknown> = Pick<
  ButtonOptions,
  'as' | 'onclick' | 'onmousedown' | 'onkeydown' | 'onkeyup' | 'onpointerdown'
> & {
  ref: HTMLElement | null
  id: string
  disabled: boolean
  openOnHover: boolean | undefined
  delay: number
  closeDelay: number
  payload: Payload | undefined
  detached: boolean
  rtl: boolean
}

export class MenuTrigger<Payload = unknown> {
  #menu: MenuRoot
  #menubar: MenubarRoot | undefined
  #options: () => MenuTriggerOptions<Payload>

  #allowMouseUpTimeout = new Timeout()
  #hoverOpenedAt = 0
  #ignoreNextClick = false

  #triggerContext: {
    tree: FloatingTree<MenuTreeEvents> | undefined
    parentNode: { id: string } | undefined
    nodeId: string
    menubar: MenubarRoot | undefined
  }

  #item: CompositeItem | undefined
  #button: Button
  guards: TriggerFocusGuards

  disabled = $derived.by(
    () => this.#options().disabled || this.#menu.disabled || (this.#menubar?.disabled ?? false)
  )

  open = $derived.by(() => this.#menu.open && this.#menu.triggerElement === this.#options().ref)

  tabindex = $derived.by(() => this.#item?.tabindex)

  get attrs() {
    return this.#button.attrs
  }

  get attach() {
    return this.#button.attach
  }

  constructor(
    menu: MenuRoot,
    menubar: MenubarRoot | undefined,
    options: () => MenuTriggerOptions<Payload>
  ) {
    this.#menu = menu
    this.#menubar = menubar
    this.#options = options

    this.#triggerContext = {
      tree: FloatingTreeContext.getOr() as FloatingTree<MenuTreeEvents> | undefined,
      parentNode: FloatingNodeContext.getOr(),
      nodeId: nextFloatingId(),
      menubar: menubar
    }

    const ownsPopup = $derived(menu.nodeId === this.#triggerContext.nodeId)

    registerFloatingNode<MenuTreeEvents>({
      tree: () => this.#triggerContext.tree ?? menu.tree,
      id: () => this.#triggerContext.nodeId,
      parentId: () => this.#triggerContext.parentNode?.id ?? null,
      open: () => ownsPopup && menu.open,
      floating: () => (ownsPopup ? menu.popupElement : null)
    })

    // An already-mounted portal reads the tree while rendering, before the effect below runs.
    if (menu.triggerElement == null) menu.adoptTriggerContext(this.#triggerContext)
    $effect.pre(() => {
      if (menu.triggerElement === this.#options().ref) {
        menu.adoptTriggerContext(this.#triggerContext)
      }
    })

    $effect(this.#allowMouseUpTimeout.disposeEffect)

    this.#item = menubar
      ? new CompositeItem(() => ({
          composite: menubar.composite,
          ref: this.#options().ref,
          disabled: this.disabled
        }))
      : undefined

    $effect(() => {
      if (menubar) {
        menu.keyboardEventRelay = menubar.composite.onkeydown
        return () => {
          menu.keyboardEventRelay = undefined
        }
      }
    })

    $effect(() => {
      const { ref, id } = this.#options()
      if (!ref) return
      return menu.triggerElements.add(id, ref)
    })

    $effect(() => {
      if (menu.triggerElement !== this.#options().ref) return
      menu.hoverCloseDelay = this.#options().closeDelay
      if (this.#options().ref) menu.payload = this.#options().payload
    })

    const safePolygonGuard = safePolygon(() => ({ blockPointerEvents: !menubar }))
    hoverReferenceInteraction(menu, () => {
      const opts = this.#options()
      return {
        enabled:
          (opts.openOnHover ?? menubar?.hasSubmenuOpen ?? false) &&
          !this.disabled &&
          (!menubar || (menubar.hasSubmenuOpen && !this.open)),
        mouseOnly: true,
        move: false,
        closeGuard: safePolygonGuard,
        restMs: menubar?.hasSubmenuOpen ? 0 : opts.delay,
        delay: { close: opts.closeDelay },
        triggerElement: opts.ref,
        tree: menu.tree,
        isActiveTrigger: menu.triggerElement === opts.ref
      }
    })

    $effect(() => {
      if (menu.open && menu.openChangeReason === REASONS.triggerHover) {
        this.#hoverOpenedAt = Date.now()
      }
    })

    $effect(() => {
      if (!this.open && menu.parentType === undefined) {
        menu.allowMouseUpTrigger = false
      }
    })

    $effect(() => {
      // The reason is read untracked so that only an open change re-registers the listener.
      if (this.open && untrack(() => menu.openChangeReason) === REASONS.triggerHover) {
        return this.#listenForDocumentMouseUp()
      }
    })

    this.guards = new TriggerFocusGuards(() => ({
      close: (event) => menu.setOpen(false, REASONS.focusOut, event),
      positionerElement: menu.positionerElement,
      popupElement: menu.popupElement,
      triggerFocusTargetElement: menu.triggerFocusTargetElement
    }))

    this.#button = new Button(() => {
      const opts = this.#options()
      return {
        disabled: this.disabled,
        as: opts.as,
        composite: menubar != null,
        focusableWhenDisabled: false,
        onclick: chain(
          opts.onclick,
          (e) => menu.openInteractionHandlers?.onclick(e),
          this.#onclick
        ),
        onkeydown: chain(opts.onkeydown, this.#onkeydown),
        onkeyup: opts.onkeyup,
        onpointerdown: chain(opts.onpointerdown, this.#onpointerdown)
      }
    })
  }

  #listenForDocumentMouseUp(): () => void {
    const doc = this.#options().ref?.ownerDocument ?? document
    return on(doc, 'mouseup', this.#onmouseup, { once: true })
  }

  #onmouseup = (mouseEvent: MouseEvent): void => {
    const menu = this.#menu
    const element = this.#options().ref
    if (!element) return

    this.#allowMouseUpTimeout.clear()
    menu.allowMouseUpTrigger = false

    const target = getTarget(mouseEvent)

    if (
      contains(element, target) ||
      contains(menu.positionerElement, target) ||
      findRootOwnerId(target) === menu.rootId
    ) {
      return
    }

    if (isMouseWithinBounds(mouseEvent, element)) return

    menu.tree.events.emit('close', { domEvent: mouseEvent, reason: REASONS.cancelOpen })
  }

  #claimTrigger(): void {
    const opts = this.#options()
    this.#menu.triggerElement = opts.ref
    this.#menu.payload = opts.payload
  }

  onmousedown = (event: MouseEvent): void => {
    const menu = this.#menu
    const menubar = this.#menubar

    const preventable = makeEventPreventable(event)
    this.#options().onmousedown?.(preventable)
    this.#ignoreNextClick = preventable.shardsUIHandlerPrevented ?? false
    if (this.#ignoreNextClick) return

    if (this.disabled || menu.open) return
    if (menubar) {
      this.#ignoreNextClick = true
      this.#claimTrigger()
      menu.setOpen(true, REASONS.triggerPress)
    }
    this.#allowMouseUpTimeout.start(MOUSE_UP_ARM_DELAY, () => {
      menu.allowMouseUpTrigger = true
    })
    this.#listenForDocumentMouseUp()
  }

  #onclick = (event: MouseEvent): void => {
    const menu = this.#menu
    if (this.disabled) return
    if (this.#ignoreNextClick) {
      this.#ignoreNextClick = false
      return
    }
    const patientClickCandidate = menu.parentType === undefined && this.open
    if (
      patientClickCandidate &&
      menu.openChangeReason === REASONS.triggerHover &&
      Date.now() - this.#hoverOpenedAt < PATIENT_CLICK_THRESHOLD
    ) {
      menu.setOpen(true, REASONS.triggerPress, event)
      return
    }
    // `open` tracks `triggerElement`, so the next state must be read before rebinding it.
    const nextOpen = !this.open
    this.#claimTrigger()
    menu.setOpen(nextOpen, REASONS.triggerPress, event)
  }

  onmousemove = (): void => {
    const menu = this.#menu
    if (menu.mounted && menu.triggerElement === this.#options().ref) menu.allowMouseEnter = true
    this.#item?.focusOnHover()
  }

  #openAndFocusOnKey(
    which: 'first' | 'last',
    event: KeyboardEvent,
    reason: MenuOpenChangeReason
  ): void {
    this.#claimTrigger()
    this.#menu.openAndFocus(which, reason, this.#options().detached ? undefined : event)
  }

  #onkeydown = (event: KeyboardEvent): void => {
    const menu = this.#menu
    const menubar = this.#menubar
    if (this.disabled) return
    menu.isPointerModality = false

    if (menubar) {
      const openKey =
        menubar.orientation === 'horizontal'
          ? 'ArrowDown'
          : this.#options().rtl
            ? 'ArrowLeft'
            : 'ArrowRight'
      if (event.key === openKey) {
        event.preventDefault()
        event.stopPropagation()
        this.#openAndFocusOnKey('first', event, REASONS.listNavigation)
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        this.#openAndFocusOnKey('first', event, REASONS.triggerPress)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      this.#openAndFocusOnKey('first', event, REASONS.listNavigation)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      this.#openAndFocusOnKey('last', event, REASONS.listNavigation)
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (!menu.open) menu.pendingFocus = 'first'
    }
  }

  onfocus = (event: FocusEvent): void => {
    const menu = this.#menu
    const menubar = this.#menubar
    const item = this.#item

    if (menubar && item && item.index > -1 && !this.disabled) {
      menubar.composite.setHighlightedIndex(item.index)
    }
    if (
      menubar &&
      menubar.hasSubmenuOpen &&
      !this.disabled &&
      !this.open &&
      matchesFocusVisible(getTarget(event))
    ) {
      this.#claimTrigger()
      menu.setOpen(true, REASONS.triggerFocus)
    }
  }

  #onpointerdown = (event: PointerEvent): void => {
    this.#menu.openInteractionHandlers?.onpointerdown(event)
  }
}
