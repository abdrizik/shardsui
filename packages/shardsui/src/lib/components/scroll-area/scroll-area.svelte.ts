import { clamp } from '$lib/internal/clamp'
import { dataAttrs } from '$lib/internal/data-attrs'
import type { TextDirection } from '$lib/internal/direction-context'
import { getMaxScrollOffset, normalizeScrollOffset } from '$lib/internal/scroll-edges'
import { safelyChangePointerCapture } from '$lib/internal/swipe-dismiss.svelte'
import { Timeout } from '$lib/internal/timeout'
import type { Orientation } from '$lib/internal/types'
import { getOffset } from './get-offset'

// ms the scrollbars stay in their scrolling state after the last change in scroll offset.
const SCROLL_TIMEOUT = 500
// px floor on thumb length, so the thumb stays grabbable when the content dwarfs the viewport.
const MIN_THUMB_SIZE = 16

function applyOverscrollThumb(
  thumb: HTMLElement,
  sizeVar: string,
  scrollFromStart: number,
  maxScroll: number,
  content: number,
  size: number,
  maxThumbOffset: number
): number {
  const clamped = clamp(scrollFromStart, 0, maxScroll)
  const overscroll = scrollFromStart - clamped
  const nextSize = Math.max(MIN_THUMB_SIZE, (size * content) / (content + Math.abs(overscroll)))
  thumb.style.setProperty(sizeVar, overscroll ? `${nextSize}px` : '')

  const offset = maxScroll ? (clamped / maxScroll) * maxThumbOffset : 0
  return offset + (overscroll > 0 ? size - nextSize : 0)
}

function changed<T extends object>(prev: T, next: T): boolean {
  for (const key of Object.keys(next) as (keyof T)[]) {
    if (prev[key] !== next[key]) return true
  }
  return false
}

type HiddenScrollbars = {
  x: boolean
  y: boolean
  corner: boolean
}

type OverflowEdges = {
  xStart: boolean
  xEnd: boolean
  yStart: boolean
  yEnd: boolean
}

export type OverflowEdgeThreshold = {
  xStart: number
  xEnd: number
  yStart: number
  yEnd: number
}

type Size = {
  width: number
  height: number
}

type Coords = {
  x: number
  y: number
}

export type ScrollAreaRootState = {
  scrolling: boolean
  hasOverflowX: boolean
  hasOverflowY: boolean
  overflowXStart: boolean
  overflowXEnd: boolean
  overflowYStart: boolean
  overflowYEnd: boolean
  cornerHidden: boolean
}

type ScrollAreaRootOptions = {
  overflowEdgeThreshold: number | Partial<OverflowEdgeThreshold> | undefined
  direction: TextDirection
}

export class ScrollAreaRoot {
  #options: () => ScrollAreaRootOptions

  #activePointerId: number | null = null
  #savedSnapType: string | null = null
  #dragStartY = 0
  #dragStartX = 0
  #dragStartScrollTop = 0
  #dragStartScrollLeft = 0
  #dragOrientation: Orientation = 'vertical'

  #scrollXTimeout = new Timeout()
  #scrollYTimeout = new Timeout()

  #scrollPosition: Coords = { x: 0, y: 0 }

  hovering = $state(false)
  touchModality = $state(false)
  scrollingX = $state(false)
  scrollingY = $state(false)
  hasMeasured = $state(false)
  hiddenScrollbars = $state.raw<HiddenScrollbars>({ x: true, y: true, corner: true })
  overflowEdges = $state.raw<OverflowEdges>({
    xStart: false,
    xEnd: false,
    yStart: false,
    yEnd: false
  })
  thumbSize = $state.raw<Size>({ width: 0, height: 0 })
  cornerSize = $state.raw<Size>({ width: 0, height: 0 })

  viewportElement = $state<HTMLElement | null>(null)
  scrollbarYElement = $state<HTMLElement | null>(null)
  scrollbarXElement = $state<HTMLElement | null>(null)
  thumbYElement = $state<HTMLElement | null>(null)
  thumbXElement = $state<HTMLElement | null>(null)
  cornerElement = $state<HTMLElement | null>(null)

  direction = $derived.by(() => this.#options().direction)

  overflowEdgeThreshold = $derived.by((): OverflowEdgeThreshold => {
    const threshold = this.#options().overflowEdgeThreshold
    const thresholds =
      typeof threshold === 'number'
        ? { xStart: threshold, xEnd: threshold, yStart: threshold, yEnd: threshold }
        : threshold

    return {
      xStart: Math.max(0, thresholds?.xStart || 0),
      xEnd: Math.max(0, thresholds?.xEnd || 0),
      yStart: Math.max(0, thresholds?.yStart || 0),
      yEnd: Math.max(0, thresholds?.yEnd || 0)
    }
  })

  state: ScrollAreaRootState = $derived({
    scrolling: this.scrollingX || this.scrollingY,
    hasOverflowX: !this.hiddenScrollbars.x,
    hasOverflowY: !this.hiddenScrollbars.y,
    overflowXStart: this.overflowEdges.xStart,
    overflowXEnd: this.overflowEdges.xEnd,
    overflowYStart: this.overflowEdges.yStart,
    overflowYEnd: this.overflowEdges.yEnd,
    cornerHidden: this.hiddenScrollbars.corner
  })

  stateAttrs = $derived(
    dataAttrs({
      scrolling: this.state.scrolling,
      'has-overflow-x': this.state.hasOverflowX,
      'has-overflow-y': this.state.hasOverflowY,
      'overflow-x-start': this.state.overflowXStart,
      'overflow-x-end': this.state.overflowXEnd,
      'overflow-y-start': this.state.overflowYStart,
      'overflow-y-end': this.state.overflowYEnd
    })
  )

  constructor(options: () => ScrollAreaRootOptions) {
    this.#options = options

    $effect(this.#scrollXTimeout.disposeEffect)
    $effect(this.#scrollYTimeout.disposeEffect)
  }

  #setScrolling = (orientation: Orientation, value: boolean) => {
    const vertical = orientation === 'vertical'
    const timeout = vertical ? this.#scrollYTimeout : this.#scrollXTimeout

    if (vertical) this.scrollingY = value
    else this.scrollingX = value

    timeout.clear()
    if (value) {
      timeout.start(SCROLL_TIMEOUT, () => {
        if (vertical) this.scrollingY = false
        else this.scrollingX = false
      })
    }
  }

  markScrolled = (next: Coords) => {
    const offsetX = next.x - this.#scrollPosition.x
    const offsetY = next.y - this.#scrollPosition.y
    this.#scrollPosition = next

    if (offsetY !== 0) this.#setScrolling('vertical', true)
    if (offsetX !== 0) this.#setScrolling('horizontal', true)
  }

  measure = () => {
    const viewport = this.viewportElement
    if (!viewport) return

    const scrollableHeight = viewport.scrollHeight
    const scrollableWidth = viewport.scrollWidth
    const viewportHeight = viewport.clientHeight
    const viewportWidth = viewport.clientWidth
    const scrollTop = viewport.scrollTop
    const scrollLeft = viewport.scrollLeft

    this.hasMeasured = true

    if (scrollableHeight === 0 || scrollableWidth === 0) return

    const scrollbarY = this.scrollbarYElement
    const scrollbarX = this.scrollbarXElement
    const thumbY = this.thumbYElement
    const thumbX = this.thumbXElement

    const scrollbarYHidden = viewportHeight >= scrollableHeight
    const scrollbarXHidden = viewportWidth >= scrollableWidth
    const nextHidden: HiddenScrollbars = {
      x: scrollbarXHidden,
      y: scrollbarYHidden,
      corner: scrollbarXHidden || scrollbarYHidden
    }
    const ratioX = viewportWidth / scrollableWidth
    const ratioY = viewportHeight / scrollableHeight
    const maxScrollLeft = getMaxScrollOffset(scrollableWidth, viewportWidth)
    const maxScrollTop = getMaxScrollOffset(scrollableHeight, viewportHeight)

    const isRtl = this.#options().direction === 'rtl'
    const scrollLeftFromStart = normalizeScrollOffset(
      isRtl ? -scrollLeft : scrollLeft,
      maxScrollLeft
    )
    const scrollLeftFromEnd = maxScrollLeft - scrollLeftFromStart

    const scrollTopFromStart = normalizeScrollOffset(scrollTop, maxScrollTop)
    const scrollTopFromEnd = maxScrollTop - scrollTopFromStart

    const nextWidth = scrollbarXHidden ? 0 : viewportWidth
    const nextHeight = scrollbarYHidden ? 0 : viewportHeight

    let nextCornerWidth = 0
    let nextCornerHeight = 0
    if (!scrollbarXHidden && !scrollbarYHidden) {
      nextCornerWidth = scrollbarY?.offsetWidth || 0
      nextCornerHeight = scrollbarX?.offsetHeight || 0
    }

    const cornerSize = this.cornerSize
    const cornerNotYetSized = cornerSize.width === 0 && cornerSize.height === 0
    const cornerWidthOffset = cornerNotYetSized ? nextCornerWidth : 0
    const cornerHeightOffset = cornerNotYetSized ? nextCornerHeight : 0

    const scrollbarXOffset = getOffset(scrollbarX, 'padding', 'x')
    const scrollbarYOffset = getOffset(scrollbarY, 'padding', 'y')
    const thumbXOffset = getOffset(thumbX, 'margin', 'x')
    const thumbYOffset = getOffset(thumbY, 'margin', 'y')

    const idealNextWidth = nextWidth - scrollbarXOffset - thumbXOffset
    const idealNextHeight = nextHeight - scrollbarYOffset - thumbYOffset

    const maxNextWidth = scrollbarX
      ? Math.min(scrollbarX.offsetWidth - cornerWidthOffset, idealNextWidth)
      : idealNextWidth
    const maxNextHeight = scrollbarY
      ? Math.min(scrollbarY.offsetHeight - cornerHeightOffset, idealNextHeight)
      : idealNextHeight

    const nextThumbWidth = Math.max(MIN_THUMB_SIZE, maxNextWidth * ratioX)
    const nextThumbHeight = Math.max(MIN_THUMB_SIZE, maxNextHeight * ratioY)

    const nextThumbSize: Size = { width: nextThumbWidth, height: nextThumbHeight }
    if (changed(this.thumbSize, nextThumbSize)) {
      this.thumbSize = nextThumbSize
    }

    if (scrollbarY && thumbY) {
      const maxThumbOffsetY =
        scrollbarY.offsetHeight - nextThumbHeight - scrollbarYOffset - thumbYOffset
      const thumbOffsetY = applyOverscrollThumb(
        thumbY,
        '--scroll-area-thumb-height',
        scrollTop,
        maxScrollTop,
        scrollableHeight,
        nextThumbHeight,
        maxThumbOffsetY
      )
      thumbY.style.transform = `translate3d(0,${thumbOffsetY}px,0)`
    }

    if (scrollbarX && thumbX) {
      const maxThumbOffsetX =
        scrollbarX.offsetWidth - nextThumbWidth - scrollbarXOffset - thumbXOffset
      const thumbOffsetX = applyOverscrollThumb(
        thumbX,
        '--scroll-area-thumb-width',
        isRtl ? -scrollLeft : scrollLeft,
        maxScrollLeft,
        scrollableWidth,
        nextThumbWidth,
        maxThumbOffsetX
      )
      thumbX.style.transform = `translate3d(${isRtl ? -thumbOffsetX : thumbOffsetX}px,0,0)`
    }

    viewport.style.setProperty('--scroll-area-overflow-x-start', `${scrollLeftFromStart}px`)
    viewport.style.setProperty('--scroll-area-overflow-x-end', `${scrollLeftFromEnd}px`)
    viewport.style.setProperty('--scroll-area-overflow-y-start', `${scrollTopFromStart}px`)
    viewport.style.setProperty('--scroll-area-overflow-y-end', `${scrollTopFromEnd}px`)

    const nextCornerSize: Size = { width: nextCornerWidth, height: nextCornerHeight }
    if (this.cornerElement && changed(cornerSize, nextCornerSize)) {
      this.cornerSize = nextCornerSize
    }

    if (changed(this.hiddenScrollbars, nextHidden)) {
      this.hiddenScrollbars = nextHidden
    }

    const threshold = this.overflowEdgeThreshold
    const nextEdges: OverflowEdges = {
      xStart: scrollLeftFromStart > threshold.xStart,
      xEnd: scrollLeftFromEnd > threshold.xEnd,
      yStart: scrollTopFromStart > threshold.yStart,
      yEnd: scrollTopFromEnd > threshold.yEnd
    }
    if (changed(this.overflowEdges, nextEdges)) {
      this.overflowEdges = nextEdges
    }
  }

  disableViewportSnap = () => {
    const viewport = this.viewportElement
    if (viewport && this.#savedSnapType === null) {
      this.#savedSnapType = viewport.style.scrollSnapType
      viewport.style.scrollSnapType = 'none'
    }
  }

  #activeThumb() {
    return this.#dragOrientation === 'vertical' ? this.thumbYElement : this.thumbXElement
  }

  startThumbDrag = (event: PointerEvent, orientation: Orientation) => {
    if (event.button !== 0) return
    if (
      this.#activePointerId !== null &&
      this.#activeThumb()?.hasPointerCapture(this.#activePointerId)
    ) {
      return
    }

    this.#activePointerId = event.pointerId
    this.#dragStartY = event.clientY
    this.#dragStartX = event.clientX
    this.#dragOrientation = orientation

    if (this.viewportElement) {
      this.#dragStartScrollTop = this.viewportElement.scrollTop
      this.#dragStartScrollLeft = this.viewportElement.scrollLeft
      this.disableViewportSnap()
    }

    const thumb = this.#activeThumb()
    if (thumb) safelyChangePointerCapture(thumb, event.pointerId, 'setPointerCapture')
  }

  dragThumb = (event: PointerEvent) => {
    if (event.pointerId !== this.#activePointerId) return
    if (event.buttons % 2 === 0) {
      this.endThumbDrag(event)
      return
    }

    const viewport = this.viewportElement
    if (!viewport) return

    const vertical = this.#dragOrientation === 'vertical'
    const thumb = vertical ? this.thumbYElement : this.thumbXElement
    const scrollbar = vertical ? this.scrollbarYElement : this.scrollbarXElement
    if (!thumb || !scrollbar) return

    const axis = vertical ? 'y' : 'x'
    const scrollbarOffset = getOffset(scrollbar, 'padding', axis)
    const thumbOffset = getOffset(thumb, 'margin', axis)
    const thumbSize = vertical ? thumb.offsetHeight : thumb.offsetWidth
    const trackSize = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth
    const maxThumbOffset = trackSize - thumbSize - scrollbarOffset - thumbOffset
    const delta = vertical ? event.clientY - this.#dragStartY : event.clientX - this.#dragStartX
    const scrollRatio = maxThumbOffset <= 0 ? 0 : delta / maxThumbOffset

    const scrollableSize = vertical ? viewport.scrollHeight : viewport.scrollWidth
    const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth
    const startScroll = vertical ? this.#dragStartScrollTop : this.#dragStartScrollLeft
    const nextScroll = startScroll + scrollRatio * (scrollableSize - viewportSize)

    if (vertical) viewport.scrollTop = nextScroll
    else viewport.scrollLeft = nextScroll
    this.#setScrolling(this.#dragOrientation, true)
    event.preventDefault()
  }

  endThumbDrag = (event: PointerEvent) => {
    if (event.pointerId !== this.#activePointerId) return

    this.#activePointerId = null
    this.#setScrolling(this.#dragOrientation, false)

    if (this.#savedSnapType !== null) {
      if (this.viewportElement) {
        this.viewportElement.style.scrollSnapType = this.#savedSnapType
      }
      this.#savedSnapType = null
    }

    const thumb = this.#activeThumb()
    // `pointercancel` releases capture implicitly, so guard against releasing a
    // capture we no longer hold (which would throw).
    if (thumb?.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId)
    }
  }

  markTouchModality = (event: PointerEvent) => {
    this.touchModality = event.pointerType === 'touch'
  }

  markHovering = (event: PointerEvent) => {
    this.markTouchModality(event)
    if (event.pointerType !== 'touch') {
      this.hovering = true
    }
  }

  clearHovering = () => {
    this.hovering = false
  }
}
