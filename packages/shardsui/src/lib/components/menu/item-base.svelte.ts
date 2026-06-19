import { isMac } from '$lib/internal/detect-browser'
import { dispatchClickWithModifiers } from '$lib/internal/dispatch-click-with-modifiers'
import { contains } from '$lib/internal/dom'
import { REASONS } from '$lib/internal/reasons'
import { isStationaryWebKitPointer } from '$lib/internal/stationary-pointer'
import { isHTMLElement } from '@floating-ui/utils/dom'
import { MenuContext } from './context'
import type { MenuRoot } from './menu.svelte'

type MenuItemRegistrationOptions = {
  menu: MenuRoot | undefined
  ref: HTMLElement | null
  disabled: boolean
}

export class MenuItemRegistration {
  #options: () => MenuItemRegistrationOptions

  #menu = $derived.by(() => this.#options().menu)
  #ref = $derived.by(() => this.#options().ref)

  #index = $derived.by(() => this.#menu?.items.indexOf(this.#ref) ?? -1)
  highlighted = $derived.by(
    () => this.#menu?.items.highlightedIndex === this.#index && this.#index >= 0
  )

  constructor(options: () => MenuItemRegistrationOptions) {
    this.#options = options

    $effect(() => {
      const menu = this.#menu
      const element = this.#ref
      if (!menu || !element) return

      return menu.items.registerItem(element, { label: element.textContent?.trim() ?? '' })
    })
  }

  highlightOnHover = (event: MouseEvent): void => {
    const menu = this.#menu
    const element = this.#ref
    if (!menu || !element) return
    if (
      !isStationaryWebKitPointer(event) &&
      !this.#options().disabled &&
      menu.highlightItemOnHover &&
      this.#index >= 0
    ) {
      menu.items.focusItem(this.#index, false)
    }
    menu.tree.events.emit('itemhover', { nodeId: menu.nodeId, target: element })
  }

  clearHighlightOnLeave = (event: PointerEvent): void => {
    const menu = this.#menu
    if (!menu || !menu.open || !menu.isPointerModality || event.pointerType === 'touch') return
    if (!menu.highlightItemOnHover) return

    const relatedTarget = event.relatedTarget
    if (isHTMLElement(relatedTarget) && menu.items.indexOf(relatedTarget) !== -1) return

    menu.items.clearQueuedFocus()
    menu.items.highlightedIndex = -1

    const popup = menu.popupElement
    if (popup && contains(popup, popup.ownerDocument.activeElement)) {
      popup.focus({ preventScroll: true })
    }
  }
}

type MenuItemBaseOptions = {
  disabled: boolean
  closeOnClick: boolean
  ref: HTMLElement | null
}

export class MenuItemBase {
  #options: () => MenuItemBaseOptions
  #menu: MenuRoot
  #registration: MenuItemRegistration

  disabled = $derived.by(() => this.#options().disabled || this.#menu.disabled)
  highlighted = $derived.by(() => this.#registration.highlighted)
  tabindex = $derived.by(() => (this.#menu.open && this.highlighted ? 0 : -1))

  constructor(options: () => MenuItemBaseOptions) {
    this.#options = options
    this.#menu = MenuContext.get()
    this.#registration = new MenuItemRegistration(() => ({
      menu: this.#menu,
      ref: this.#options().ref,
      disabled: this.disabled
    }))
  }

  onmousemove = (event: MouseEvent) => {
    this.#registration.highlightOnHover(event)
  }

  onpointerleave = (event: PointerEvent) => {
    this.#registration.clearHighlightOnLeave(event)
  }

  onmouseup = (event: MouseEvent) => {
    const contextMenu = this.#menu.insideContextMenu
    if (contextMenu) {
      const openPoint = contextMenu.initialCursorPoint
      contextMenu.initialCursorPoint = null
      if (
        openPoint &&
        Math.abs(event.clientX - openPoint.x) <= 1 &&
        Math.abs(event.clientY - openPoint.y) <= 1
      ) {
        return
      }
      // On non-macOS platforms this mouseup belongs to the right-click gesture that opened the menu.
      if (!isMac && event.button === 2) return
    }

    const ref = this.#options().ref
    if (ref && this.#menu.allowMouseUpTrigger && (!contextMenu || event.button === 2)) {
      dispatchClickWithModifiers(ref, event, { detail: 1 })
    }
  }

  onkeydown = (event: KeyboardEvent) => {
    if (event.key === ' ' && this.#menu.typing) {
      event.preventDefault()
    }
  }

  onclick = (event: MouseEvent) => {
    if (this.#options().closeOnClick) {
      this.#menu.tree.events.emit('close', { domEvent: event, reason: REASONS.itemPress })
    }
  }
}
