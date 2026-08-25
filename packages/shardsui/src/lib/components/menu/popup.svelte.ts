import { attachElement } from '$lib/internal/attach-element'
import { COMPOSITE_KEYS } from '$lib/internal/composite'
import type { DirectionContextValue } from '$lib/internal/direction-context'
import { contains } from '$lib/internal/dom'
import type { AnchorPositioning } from '$lib/internal/floating/anchor-positioning.svelte'
import { dismiss } from '$lib/internal/floating/dismiss.svelte'
import { manageFocus, type FocusTarget } from '$lib/internal/floating/focus-manager.svelte'
import { hoverFloatingInteraction } from '$lib/internal/floating/hover/floating.svelte'
import { publishCloseGuardContext } from '$lib/internal/floating/publish-close-guard-context.svelte'
import { createTypeahead } from '$lib/internal/floating/typeahead.svelte'
import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
import { mergeStyle } from '$lib/internal/merge-style'
import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
import { REASONS } from '$lib/internal/reasons'
import { isStationaryWebKitPointer } from '$lib/internal/stationary-pointer'
import type { MenuOpenChangeReason } from './context'
import { findRootOwnerId } from './find-root-owner-id'
import type { MenuRoot } from './menu.svelte'

type MenuPopupOptions = {
  ref: HTMLElement | null
  id: string
  style: string | null | undefined
  finalFocus: FocusTarget | undefined
}

export class MenuPopup {
  #menu: MenuRoot
  #positioner: AnchorPositioning | undefined
  #direction: DirectionContextValue
  #insideToolbar: boolean
  #options: () => MenuPopupOptions

  #typeahead: ReturnType<typeof createTypeahead>

  #isContextMenu = $derived.by(() => this.#menu.parentType === 'context-menu')

  side = $derived.by(() => this.#positioner?.side ?? 'bottom')
  align = $derived.by(() => this.#positioner?.align ?? 'start')
  nested = $derived.by(() => this.#menu.parentType === 'menu')

  mergedStyle = $derived.by(() =>
    mergeStyle(getDisabledMountTransitionStyles(this.#menu.transitionStatus), this.#options().style)
  )

  #returnFocus = $derived.by(() => {
    const menu = this.#menu
    const finalFocus = this.#options().finalFocus
    if (finalFocus !== undefined) return finalFocus
    if (
      menu.parentType === undefined ||
      this.#isContextMenu ||
      menu.triggerElement ||
      (menu.parentType === 'menubar' && menu.openChangeReason !== REASONS.outsidePress)
    ) {
      return true
    }
    return false
  })

  #navigationKeys = $derived.by(() => {
    const horizontal = this.#menu.orientation === 'horizontal'
    const isRtl = this.#direction.direction === 'rtl'
    return {
      next: horizontal ? (isRtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown',
      previous: horizontal ? (isRtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp',
      closeSubmenu: horizontal ? 'ArrowUp' : isRtl ? 'ArrowRight' : 'ArrowLeft'
    }
  })

  constructor(
    menu: MenuRoot,
    positioner: AnchorPositioning | undefined,
    direction: DirectionContextValue,
    insideToolbar: boolean,
    options: () => MenuPopupOptions
  ) {
    this.#menu = menu
    this.#positioner = positioner
    this.#direction = direction
    this.#insideToolbar = insideToolbar
    this.#options = options

    $effect.pre(() => {
      menu.popupId = this.#options().id
      return () => {
        menu.popupId = undefined
      }
    })

    openChangeComplete(() => ({
      open: menu.open,
      element: this.#options().ref,
      onComplete: () => {
        if (menu.open) menu.onOpenChangeComplete?.(true)
      }
    }))

    manageFocus(() => {
      const ref = this.#options().ref
      return {
        open: menu.open,
        modal: this.#isContextMenu,
        enabled: menu.mounted && !!ref,
        popupElement: ref,
        triggerElement: menu.triggerElement,
        initialFocus: menu.parentType !== 'menu' ? undefined : false,
        finalFocus: this.#returnFocus,
        openMethod: menu.openMethod,
        closeEvent: menu.lastCloseEvent,
        closeReason: menu.openChangeReason,
        restoreFocus: true,
        closeOnFocusOut: true,
        onFocusOut: (event) => {
          if (findRootOwnerId(event.relatedTarget) === menu.rootId) return
          menu.setOpen(false, REASONS.focusOut, event)
        },
        getNextFocusableElement: () =>
          menu.parentType === undefined ? menu.triggerFocusTargetElement : null
      }
    })

    publishCloseGuardContext(() => ({
      data: menu.data,
      side: positioner?.renderedSide ?? 'bottom',
      domReference: menu.domReferenceElement,
      floating: menu.floatingElement,
      nodeId: menu.nodeId
    }))

    this.#typeahead = createTypeahead(() => ({
      enabled: !menu.disabled,
      items: menu.items.labels(),
      elements: menu.items.elements(),
      activeIndex: menu.items.highlightedIndex,
      referenceElement: menu.domReferenceElement,
      floatingElement: menu.floatingElement,
      onMatch: (i) => menu.items.focusItem(i),
      onTyping: (isTyping) => {
        menu.typing = isTyping
      }
    }))

    dismiss(() => ({
      open: menu.open,
      enabled: !menu.disabled,
      tree: menu.tree,
      nodeId: menu.nodeId,
      popupElement: menu.floatingElement,
      referenceElement: menu.domReferenceElement,
      bubbles: { escapeKey: menu.closeParentOnEsc && menu.parentType === 'menu' },
      outsidePress: menu.allowsOutsidePress,
      onClose: (reason, event) => {
        const closeReason = reason === REASONS.escapeKey ? REASONS.escapeKey : REASONS.outsidePress
        menu.setOpen(false, closeReason, event)
      },
      isInsideElement: (target) =>
        contains(this.#options().ref, target) || menu.containsTrigger(target)
    }))

    hoverFloatingInteraction(menu, () => ({
      enabled:
        menu.hoverEnabled &&
        !menu.disabled &&
        menu.parentType !== 'menubar' &&
        menu.parentType !== 'context-menu',
      closeDelay: menu.hoverCloseDelay,
      tree: menu.tree,
      nodeId: menu.nodeId,
      parentId: menu.parentNodeId
    }))

    $effect(() => {
      function onTreeClose(event: { domEvent: Event; reason: MenuOpenChangeReason }) {
        menu.setOpen(false, event.reason, event.domEvent)
      }
      return menu.tree.events.on('close', onTreeClose)
    })
  }

  registerPopup = attachElement((el: HTMLElement | null) => {
    this.#menu.popupElement = el
  })

  #currentIndex(): number {
    const ref = this.#options().ref
    const active = ref ? ref.ownerDocument.activeElement : null
    const focusedIndex = this.#menu.items.indexOf(active)
    return focusedIndex >= 0 ? focusedIndex : this.#menu.items.highlightedIndex
  }

  #moveHighlight(direction: 1 | -1): void {
    const items = this.#menu.items
    const current = this.#currentIndex()
    const start = current < 0 ? (direction === 1 ? -1 : items.count) : current
    items.focusItem(items.stepIndex(start, direction))
  }

  #closeSubmenu(): boolean {
    const menu = this.#menu
    menu.setOpen(false, REASONS.listNavigation)
    menu.triggerElement?.focus()
    const parentOrientation = menu.parent?.orientation ?? menu.menubar?.orientation ?? 'vertical'
    return parentOrientation === menu.orientation
  }

  #applyKeyDown(event: KeyboardEvent): boolean {
    const menu = this.#menu
    const keys = this.#navigationKeys

    if (!menu.open) return false

    if (menu.parentType !== undefined && event.key === keys.closeSubmenu) {
      event.preventDefault()
      return this.#closeSubmenu()
    }
    if (event.key === keys.next) {
      event.preventDefault()
      this.#moveHighlight(1)
      return true
    }
    if (event.key === keys.previous) {
      event.preventDefault()
      this.#moveHighlight(-1)
      return true
    }
    if (event.key === 'Home') {
      event.preventDefault()
      menu.items.focusItem(menu.items.firstIndex())
      return true
    }
    if (event.key === 'End') {
      event.preventDefault()
      menu.items.focusItem(menu.items.lastIndex())
      return true
    }
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault()
      event.stopPropagation()
      menu.setOpen(false, REASONS.focusOut, event)
      menu.triggerElement?.focus()
      return true
    }
    this.#typeahead.matchKey(event)
    return false
  }

  onkeydown = (event: KeyboardEvent): void => {
    this.#menu.isPointerModality = false

    const consumedByToolbar = this.#insideToolbar && COMPOSITE_KEYS.has(event.key)
    if (consumedByToolbar) {
      event.stopPropagation()
    }

    if (this.#applyKeyDown(event) || consumedByToolbar) return

    this.#menu.keyboardEventRelay?.(event)
  }

  onmousemove = (): void => {
    const menu = this.#menu
    menu.allowMouseEnter = true
    if (menu.parentType === 'menu') {
      menu.hoverEnabled = false
    }
  }

  onpointermove = (event: PointerEvent): void => {
    if (isStationaryWebKitPointer(event)) return
    this.#menu.isPointerModality = true
  }

  onclick = (): void => {
    this.#menu.hoverEnabled = false
  }

  onfocusout = (event: FocusEvent): void => {
    this.#typeahead.resetOnFocusLeave(event)
  }
}
