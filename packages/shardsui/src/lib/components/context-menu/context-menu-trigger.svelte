<script module lang="ts">
  const LONG_PRESS_DELAY = 500
  const MOVE_TOLERANCE = 10
  const TOUCH_ANCHOR_SIZE = 10
</script>

<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { getTarget, contains } from '$lib/internal/dom'
  import type { Attachment } from 'svelte/attachments'
  import { MenuContext } from '$lib/components/menu/context'
  import { findRootOwnerId } from '$lib/components/menu/find-root-owner-id'
  import { Timeout } from '$lib/internal/timeout'
  import { chain } from '$lib/internal/chain'
  import { REASONS } from '$lib/internal/reasons'
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { on } from 'svelte/events'
  import { ContextMenuContext, type ContextMenuTriggerState } from './context'

  type Props = PartProps<
    [ContextMenuTriggerState],
    'div',
    'oncontextmenu' | 'ontouchcancel' | 'ontouchend' | 'ontouchmove' | 'ontouchstart'
  >

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    oncontextmenu,
    ontouchstart,
    ontouchmove,
    ontouchend,
    ontouchcancel,
    children,
    ...rest
  }: Props = $props()

  const contextMenu = ContextMenuContext.get()
  const menu = MenuContext.get()

  const pressTimeout = new Timeout()
  $effect(pressTimeout.disposeEffect)
  const allowMouseUpTimeout = new Timeout()
  $effect(allowMouseUpTimeout.disposeEffect)
  let pressStart: { x: number; y: number } | null = null
  let allowMouseUp = false
  let offMouseUp: (() => void) | null = null

  $effect(() => () => offMouseUp?.())

  const blockNativeContextMenu: Attachment<HTMLElement> = (element) =>
    on(element.ownerDocument, 'contextmenu', (event) => {
      if (menu.disabled) return
      const target = getTarget(event) as Node | null
      if (
        contains(element, target) ||
        contains(menu.internalBackdropElement, target) ||
        contains(menu.backdropElement, target)
      ) {
        event.preventDefault()
      }
    })

  function openAt(x: number, y: number, isTouch: boolean, event: Event) {
    contextMenu.initialCursorPoint = { x, y }
    contextMenu.anchor = {
      getBoundingClientRect() {
        const size = isTouch ? TOUCH_ANCHOR_SIZE : 0
        return DOMRect.fromRect({ width: size, height: size, x, y })
      }
    }
    allowMouseUp = false
    menu.setOpen(true, REASONS.triggerPress, event)

    allowMouseUpTimeout.start(LONG_PRESS_DELAY, () => {
      allowMouseUp = true
    })
  }

  function cancelOnMouseUp(event: MouseEvent) {
    contextMenu.allowMouseUpTrigger = false

    if (!allowMouseUp) return

    allowMouseUpTimeout.clear()
    allowMouseUp = false

    const target = getTarget(event) as Element | null
    if (contains(menu.positionerElement, target)) return
    if (target && findRootOwnerId(target) === menu.rootId) return

    menu.setOpen(false, REASONS.cancelOpen, event)
  }

  function openOnContextMenu(event: MouseEvent) {
    if (menu.disabled) return
    event.preventDefault()
    event.stopPropagation()

    contextMenu.allowMouseUpTrigger = true

    openAt(event.clientX, event.clientY, false, event)

    offMouseUp?.()
    offMouseUp = on(ref?.ownerDocument ?? document, 'mouseup', cancelOnMouseUp, { once: true })
  }

  function cancelLongPress() {
    pressTimeout.clear()
    pressStart = null
  }

  function startLongPress(event: TouchEvent) {
    if (menu.disabled) {
      cancelLongPress()
      return
    }

    contextMenu.allowMouseUpTrigger = false

    if (event.touches.length !== 1) {
      cancelLongPress()
      return
    }

    event.stopPropagation()
    const touch = event.touches[0]
    const start = { x: touch.clientX, y: touch.clientY }
    pressStart = start
    pressTimeout.start(LONG_PRESS_DELAY, () => {
      openAt(start.x, start.y, true, event)
    })
  }

  function cancelLongPressOnMove(event: TouchEvent) {
    if (event.touches.length !== 1) {
      cancelLongPress()
      return
    }

    if (!pressTimeout.isStarted() || !pressStart) return

    const touch = event.touches[0]
    const dx = Math.abs(touch.clientX - pressStart.x)
    const dy = Math.abs(touch.clientY - pressStart.y)
    if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) {
      cancelLongPress()
    }
  }

  const stateAttrs = $derived(dataAttrs({ 'popup-open': menu.open, pressed: menu.open }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach blockNativeContextMenu}
  style={mergeStyle('-webkit-touch-callout: none', style)}
  oncontextmenu={chain(oncontextmenu, openOnContextMenu)}
  ontouchstart={chain(ontouchstart, startLongPress)}
  ontouchmove={chain(ontouchmove, cancelLongPressOnMove)}
  ontouchend={chain(ontouchend, cancelLongPress)}
  ontouchcancel={chain(ontouchcancel, cancelLongPress)}
  {...rest}
>
  {@render children?.({ open: menu.open })}
</svelte:element>
