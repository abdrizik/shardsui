<script lang="ts">
  import type { Attachment } from 'svelte/attachments'
  import { on } from 'svelte/events'
  import type { Orientation, PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { clamp } from '$lib/internal/clamp'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { getTarget, contains } from '$lib/internal/dom'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { getOffset } from './get-offset'
  import {
    ScrollAreaContext,
    ScrollAreaScrollbarContext,
    type ScrollAreaScrollbarState
  } from './context'

  type Props = PartProps<[ScrollAreaScrollbarState]> & {
    orientation?: Orientation
    keepMounted?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    orientation = 'vertical',
    keepMounted = false,
    onpointerdown,
    onpointerup,
    onpointercancel,
    children,
    ...rest
  }: Props = $props()

  const scrollArea = ScrollAreaContext.get()
  const direction = DirectionContext.get()

  const vertical = $derived(orientation === 'vertical')

  ScrollAreaScrollbarContext.set({
    get orientation() {
      return orientation
    }
  })

  const attachTrack = $derived(
    vertical
      ? attachElement((el) => (scrollArea.scrollbarYElement = el))
      : attachElement((el) => (scrollArea.scrollbarXElement = el))
  )

  const forwardWheel: Attachment<HTMLElement> = (node) => {
    const viewport = scrollArea.viewportElement
    if (!viewport) return

    const onwheel = (event: WheelEvent) => {
      if (event.ctrlKey) return

      const scrollProperty = vertical ? 'scrollTop' : 'scrollLeft'
      const delta = vertical ? event.deltaY : event.deltaX
      if (delta === 0) return

      const maxScroll = vertical
        ? viewport.scrollHeight - viewport.clientHeight
        : viewport.scrollWidth - viewport.clientWidth
      // RTL horizontal scrolling uses a negative `scrollLeft` range, from 0 to `-maxScroll`.
      const rtlHorizontal = !vertical && direction.direction === 'rtl'
      const minScroll = rtlHorizontal ? -maxScroll : 0
      const maxScrollValue = rtlHorizontal ? 0 : maxScroll
      const scrollValue = viewport[scrollProperty]

      if ((scrollValue <= minScroll && delta < 0) || (scrollValue >= maxScrollValue && delta > 0)) {
        return
      }

      event.preventDefault()

      viewport[scrollProperty] = clamp(scrollValue + delta, minScroll, maxScrollValue)

      scrollArea.markScrolled({ x: viewport.scrollLeft, y: viewport.scrollTop })
    }

    return on(node, 'wheel', onwheel, { passive: false })
  }

  function scrollToTrackPosition(event: PointerEvent) {
    if (event.button !== 0) return

    const target = getTarget(event) as Node | null
    const thumb = vertical ? scrollArea.thumbYElement : scrollArea.thumbXElement

    if (contains(thumb, target)) return

    const viewport = scrollArea.viewportElement
    if (!viewport) return

    const scrollbar = vertical ? scrollArea.scrollbarYElement : scrollArea.scrollbarXElement

    if (!thumb || !scrollbar) return

    const axis = vertical ? 'y' : 'x'
    const thumbOffset = getOffset(thumb, 'margin', axis)
    const scrollbarOffset = getOffset(scrollbar, 'padding', axis)
    const thumbSize = vertical ? thumb.offsetHeight : thumb.offsetWidth
    const trackRect = scrollbar.getBoundingClientRect()
    const trackSize = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth
    const maxThumbOffset = trackSize - thumbSize - scrollbarOffset - thumbOffset

    if (maxThumbOffset <= 0) return

    scrollArea.disableViewportSnap()
    const clickPosition = vertical
      ? event.clientY - trackRect.top - thumbSize / 2 - scrollbarOffset + thumbOffset / 2
      : event.clientX - trackRect.left - thumbSize / 2 - scrollbarOffset + thumbOffset / 2
    const scrollableSize = vertical ? viewport.scrollHeight : viewport.scrollWidth
    const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth
    const scrollRatio = clickPosition / maxThumbOffset
    const maxScrollDistance = scrollableSize - viewportSize

    if (vertical) {
      viewport.scrollTop = scrollRatio * maxScrollDistance
    } else if (direction.direction === 'rtl') {
      viewport.scrollLeft = -(1 - scrollRatio) * maxScrollDistance
    } else {
      viewport.scrollLeft = scrollRatio * maxScrollDistance
    }

    scrollArea.markScrolled({ x: viewport.scrollLeft, y: viewport.scrollTop })

    scrollArea.startThumbDrag(event, orientation)
  }

  const scrolling = $derived(vertical ? scrollArea.scrollingY : scrollArea.scrollingX)

  const scrollAreaState: ScrollAreaScrollbarState = $derived({
    ...scrollArea.state,
    hovering: scrollArea.hovering,
    scrolling,
    orientation
  })

  const hidden = $derived(vertical ? scrollArea.hiddenScrollbars.y : scrollArea.hiddenScrollbars.x)
  const shouldRender = $derived(keepMounted || !hidden)

  const orientationStyle = $derived(
    vertical
      ? `top: 0; bottom: var(--scroll-area-corner-height); inset-inline-end: 0; --scroll-area-thumb-height: ${scrollArea.thumbSize.height}px;`
      : `inset-inline-start: 0; inset-inline-end: var(--scroll-area-corner-width); bottom: 0; --scroll-area-thumb-width: ${scrollArea.thumbSize.width}px;`
  )
  const mergedStyle = $derived(
    mergeStyle(
      'position: absolute; touch-action: none; -webkit-user-select: none; user-select: none',
      orientationStyle,
      style
    )
  )

  const stateAttrs = $derived(dataAttrs({ orientation, hovering: scrollArea.hovering, scrolling }))
</script>

{#if shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...scrollArea.stateAttrs}
    {...stateAttrs}
    {@attach attachTrack}
    {@attach forwardWheel}
    style={mergedStyle}
    onpointerdown={chain(onpointerdown, scrollToTrackPosition)}
    onpointerup={chain(onpointerup, scrollArea.endThumbDrag)}
    onpointercancel={chain(onpointercancel, scrollArea.endThumbDrag)}
    {...rest}
  >
    {@render children?.(scrollAreaState)}
  </svelte:element>
{/if}
