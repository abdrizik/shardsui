import type { Attachment } from 'svelte/attachments'
import { on } from 'svelte/events'
import { dispatchClickWithModifiers } from './dispatch-click-with-modifiers'
import { makeEventPreventable } from './event-preventable'

type Handler<E extends Event> = { handle(event: E): void }['handle']

export type ButtonOptions = {
  disabled?: boolean
  focusableWhenDisabled?: boolean
  composite?: boolean
  as?: keyof HTMLElementTagNameMap
  tabindex?: number | null
  onclick?: Handler<MouseEvent> | null
  onmousedown?: Handler<MouseEvent> | null
  onkeydown?: Handler<KeyboardEvent> | null
  onkeyup?: Handler<KeyboardEvent> | null
  onpointerdown?: Handler<PointerEvent> | null
}

type ButtonAttrs = {
  type?: 'button' | undefined
  role?: 'button' | undefined
  tabindex?: number | undefined
  'aria-disabled'?: 'true' | 'false' | undefined
  disabled?: true | undefined
}

export class Button {
  #options: () => ButtonOptions

  constructor(options: () => ButtonOptions) {
    this.#options = options
  }

  #disabled = $derived.by(() => this.#options().disabled ?? false)
  #focusableWhenDisabled = $derived.by(() => this.#options().focusableWhenDisabled)
  #composite = $derived.by(() => this.#options().composite ?? false)
  #native = $derived.by(() => (this.#options().as ?? 'button') === 'button')

  attrs: ButtonAttrs = $derived.by(() => {
    const exposesAriaDisabled = this.#native
      ? (this.#focusableWhenDisabled ?? this.#composite)
      : this.#disabled
    const exposesDisabled = this.#native && !this.#focusableWhenDisabled

    let tabindex: number | undefined
    if (!this.#composite) {
      const untabbable = !this.#native && this.#disabled && !this.#focusableWhenDisabled
      const requested = this.#options().tabindex
      tabindex =
        requested === null ? undefined : requested !== undefined ? requested : untabbable ? -1 : 0
    }

    return {
      type: this.#native ? 'button' : undefined,
      role: this.#native ? undefined : 'button',
      tabindex,
      'aria-disabled': exposesAriaDisabled ? (this.#disabled ? 'true' : 'false') : undefined,
      disabled: exposesDisabled && this.#disabled ? true : undefined
    }
  })

  attach: Attachment<HTMLElement> = (el) => {
    const onclick = (event: MouseEvent) => {
      if (this.#disabled) {
        event.preventDefault()
        return
      }
      this.#options().onclick?.(event)
    }

    const onmousedown = (event: MouseEvent) => {
      if (this.#disabled) return
      this.#options().onmousedown?.(event)
    }

    const onkeydown = (nativeEvent: KeyboardEvent) => {
      if (this.#disabled) {
        if (this.#focusableWhenDisabled && nativeEvent.key !== 'Tab') {
          nativeEvent.preventDefault()
        }
        return
      }

      const event = makeEventPreventable(nativeEvent)
      this.#options().onkeydown?.(event)
      if (event.shardsUIHandlerPrevented) return

      const isCurrentTarget = event.target === el
      const isLink = el instanceof HTMLAnchorElement && Boolean(el.href)
      const isEnterKey = event.key === 'Enter'
      const isSpaceKey = event.key === ' '

      if (isCurrentTarget && this.#composite && isSpaceKey) {
        const role = el.getAttribute('role')
        const isTextNavigationRole =
          role?.startsWith('menuitem') || role === 'option' || role === 'gridcell'
        if (event.defaultPrevented && isTextNavigationRole) return
        event.preventDefault()
        event.preventShardsUIHandler()
        dispatchClickWithModifiers(el, event)
        return
      }

      if (!this.#native && isCurrentTarget && !isLink) {
        if (event.defaultPrevented) return
        if (isSpaceKey || isEnterKey) {
          event.preventDefault()
        }
        if (isEnterKey) {
          event.preventShardsUIHandler()
          dispatchClickWithModifiers(el, event)
        }
        return
      }
      if (isCurrentTarget && isLink && isSpaceKey) {
        event.preventDefault()
      }
    }

    const onkeyup = (nativeEvent: KeyboardEvent) => {
      if (this.#disabled) return

      const event = makeEventPreventable(nativeEvent)
      this.#options().onkeyup?.(event)

      if (event.target === el && this.#native && this.#composite && event.key === ' ') {
        event.preventDefault()
        return
      }

      if (event.shardsUIHandlerPrevented) return

      if (
        event.target === el &&
        !this.#native &&
        !this.#composite &&
        !event.defaultPrevented &&
        event.key === ' '
      ) {
        event.preventShardsUIHandler()
        dispatchClickWithModifiers(el, event)
      }
    }

    const onpointerdown = (event: PointerEvent) => {
      if (this.#disabled) {
        event.preventDefault()
        return
      }
      this.#options().onpointerdown?.(event)
    }

    const cleanups = [
      on(el, 'click', onclick),
      on(el, 'mousedown', onmousedown),
      on(el, 'keydown', onkeydown),
      on(el, 'keyup', onkeyup),
      on(el, 'pointerdown', onpointerdown)
    ]

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }
}
