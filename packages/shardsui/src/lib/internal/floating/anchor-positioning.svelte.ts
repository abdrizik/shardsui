import { DirectionContext } from '$lib/internal/direction-context'
import {
  autoUpdate,
  computePosition,
  flip,
  hide,
  limitShift,
  offset,
  shift,
  size,
  type Middleware,
  type MiddlewareState,
  type Padding,
  type Placement
} from '@floating-ui/dom'
import {
  clamp,
  getAlignment,
  getAlignmentAxis,
  getAxisLength,
  getPaddingObject,
  getSide,
  getSideAxis
} from '@floating-ui/utils'
import { isElement } from '@floating-ui/utils/dom'
import { untrack } from 'svelte'

export type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'
export type Align = 'start' | 'center' | 'end'
export type Boundary =
  | 'clipping-ancestors'
  | Element
  | Element[]
  | { x: number; y: number; width: number; height: number }
type PhysicalSide = 'top' | 'bottom' | 'left' | 'right'

export type OffsetFunction = (data: {
  side: Side
  align: Align
  anchor: { width: number; height: number }
  positioner: { width: number; height: number }
}) => number

type SideFlipMode = {
  side?: 'flip' | 'none'
  align?: 'flip' | 'shift' | 'none'
  fallbackAxisSide?: 'start' | 'end' | 'none'
}

type SideShiftMode = {
  side?: 'shift' | 'none'
  /** Shifting the side pins the align axis, so it cannot flip. */
  align?: 'shift' | 'none'
  fallbackAxisSide?: 'start' | 'end' | 'none'
}

export type CollisionAvoidance = SideFlipMode | SideShiftMode

export type VirtualAnchorElement = { getBoundingClientRect(): DOMRect }

export type AnchorPositioningProps = {
  anchor?: Element | VirtualAnchorElement | null
  side?: Side
  align?: Align
  sideOffset?: number | OffsetFunction
  alignOffset?: number | OffsetFunction
  collisionBoundary?: Boundary
  collisionPadding?: number | Padding
  collisionAvoidance?: CollisionAvoidance
  sticky?: boolean
  arrowPadding?: number
  disableAnchorTracking?: boolean
  positionMethod?: 'absolute' | 'fixed'
}

type AnchorPositioningOptions = Omit<AnchorPositioningProps, 'anchor'> & {
  anchor: Element | VirtualAnchorElement | null
  floating: HTMLElement | null
  adaptiveOrigin?: boolean
  lazyFlip?: boolean
  shift?: { crossAxis?: boolean; rootBoundary?: 'layoutViewport' }
  inline?: Middleware | null
}

function getDPR(element: Element | null): number {
  if (typeof window === 'undefined') return 1
  const win = element?.ownerDocument.defaultView || window
  return win.devicePixelRatio || 1
}

function getAlign(placement: Placement): Align {
  const alignment = getAlignment(placement)
  return alignment === 'start' || alignment === 'end' ? alignment : 'center'
}

function getPhysicalSide(sideParam: Side, isRtl: boolean): PhysicalSide {
  return (
    {
      top: 'top',
      bottom: 'bottom',
      left: 'left',
      right: 'right',
      'inline-end': isRtl ? 'left' : 'right',
      'inline-start': isRtl ? 'right' : 'left'
    } satisfies Record<Side, PhysicalSide>
  )[sideParam]
}

function getLogicalSide(sideParam: Side, renderedSide: PhysicalSide, isRtl: boolean): Side {
  const isLogicalSideParam = sideParam === 'inline-start' || sideParam === 'inline-end'
  const logicalRight = isRtl ? 'inline-start' : 'inline-end'
  const logicalLeft = isRtl ? 'inline-end' : 'inline-start'
  return (
    {
      top: 'top',
      right: isLogicalSideParam ? logicalRight : 'right',
      bottom: 'bottom',
      left: isLogicalSideParam ? logicalLeft : 'left'
    } satisfies Record<PhysicalSide, Side>
  )[renderedSide]
}

function getOffsetData(state: MiddlewareState, sideParam: Side, isRtl: boolean) {
  const { rects, placement } = state
  return {
    side: getLogicalSide(sideParam, getSide(placement), isRtl),
    align: getAlign(placement),
    anchor: { width: rects.reference.width, height: rects.reference.height },
    positioner: { width: rects.floating.width, height: rects.floating.height }
  }
}

function arrowMiddleware(options: { element: Element; padding?: Padding }): Middleware {
  return {
    name: 'arrow',
    options,
    async fn(state) {
      const { x, y, placement, rects, platform, elements, middlewareData } = state
      const { element, padding = 0 } = options

      const paddingObject = getPaddingObject(padding)
      const coords = { x, y }
      const axis = getAlignmentAxis(placement)
      const length = getAxisLength(axis)
      const arrowDimensions = await platform.getDimensions(element)
      const isYAxis = axis === 'y'
      const minProp = isYAxis ? 'top' : 'left'
      const maxProp = isYAxis ? 'bottom' : 'right'
      const clientProp = isYAxis ? 'clientHeight' : 'clientWidth'

      const endDiff =
        rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length]
      const startDiff = coords[axis] - rects.reference[axis]

      const clientSize = elements.floating[clientProp] || rects.floating[length]

      const centerToReference = endDiff / 2 - startDiff / 2

      const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1
      const minPadding = Math.min(paddingObject[minProp], largestPossiblePadding)
      const maxPadding = Math.min(paddingObject[maxProp], largestPossiblePadding)

      const max = clientSize - arrowDimensions[length] - maxPadding
      const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference
      const offsetVal = clamp(minPadding, center, max)

      const shouldAddOffset =
        !middlewareData.arrow &&
        getAlignment(placement) != null &&
        center !== offsetVal &&
        rects.reference[length] / 2 -
          (center < minPadding ? minPadding : maxPadding) -
          arrowDimensions[length] / 2 <
          0
      const alignmentOffset = shouldAddOffset
        ? center < minPadding
          ? center - minPadding
          : center - max
        : 0

      return {
        [axis]: coords[axis] + alignmentOffset,
        data: {
          [axis]: offsetVal,
          centerOffset: center - offsetVal - alignmentOffset,
          ...(shouldAddOffset && { alignmentOffset })
        },
        reset: shouldAddOffset
      }
    }
  }
}

type AdaptiveOriginData = { sideX: 'left' | 'right'; sideY: 'top' | 'bottom' }

const DEFAULT_ADAPTIVE_ORIGIN: AdaptiveOriginData = { sideX: 'left', sideY: 'top' }

function transformOriginMiddleware(options: {
  arrowElement: Element | null | undefined
  crossAxisShiftEnabled: boolean
  getSideOffset: (state: MiddlewareState) => number
}): Middleware {
  const { arrowElement, crossAxisShiftEnabled, getSideOffset } = options
  return {
    name: 'transformOrigin',
    fn(state) {
      const renderedSide = getSide(state.placement)
      const arrowData = state.middlewareData.arrow
      const arrowCenterX = (arrowData?.x || 0) + (arrowElement?.clientWidth || 0) / 2
      const arrowCenterY = (arrowData?.y || 0) + (arrowElement?.clientHeight || 0) / 2
      const sideOffset = getSideOffset(state)

      const adjacentOrigin = (
        {
          top: `${arrowCenterX}px calc(100% + ${sideOffset}px)`,
          bottom: `${arrowCenterX}px ${-sideOffset}px`,
          left: `calc(100% + ${sideOffset}px) ${arrowCenterY}px`,
          right: `${-sideOffset}px ${arrowCenterY}px`
        } satisfies Record<PhysicalSide, string>
      )[renderedSide]

      const isOverlappingAnchor = Math.abs(state.middlewareData.shift?.y || 0) > sideOffset
      const anchorCenterY = state.rects.reference.y + state.rects.reference.height / 2 - state.y
      const shouldUseOverlapOrigin =
        crossAxisShiftEnabled && getSideAxis(state.placement) === 'y' && isOverlappingAnchor

      state.elements.floating.style.setProperty(
        '--transform-origin',
        shouldUseOverlapOrigin ? `${arrowCenterX}px ${anchorCenterY}px` : adjacentOrigin
      )
      return {}
    }
  }
}

const baseHide = hide()

const hideMiddleware: Middleware = {
  name: 'hide',
  async fn(state) {
    const { width, height, x, y } = state.rects.reference
    const isCollapsedAtOrigin = width === 0 && height === 0 && x === 0 && y === 0
    const hideResult = await baseHide.fn(state)
    return {
      data: { referenceHidden: hideResult.data?.referenceHidden || isCollapsedAtOrigin }
    }
  }
}

const adaptiveOriginMiddleware: Middleware = {
  name: 'adaptiveOrigin',
  async fn(state) {
    const {
      x,
      y,
      rects: { floating: floatingRect },
      elements: { floating },
      platform,
      strategy,
      placement
    } = state

    const win = floating.ownerDocument.defaultView ?? window
    const { transitionDuration } = win.getComputedStyle(floating)
    if (transitionDuration === '0s' || transitionDuration === '') {
      return { x, y, data: DEFAULT_ADAPTIVE_ORIGIN }
    }

    const offsetParent = await platform.getOffsetParent?.(floating)
    let offsetDimensions = { width: 0, height: 0 }

    if (strategy === 'fixed' && win.visualViewport) {
      offsetDimensions = { width: win.visualViewport.width, height: win.visualViewport.height }
    } else if (offsetParent === win) {
      const { documentElement } = floating.ownerDocument
      offsetDimensions = {
        width: documentElement.clientWidth,
        height: documentElement.clientHeight
      }
    } else if (await platform.isElement?.(offsetParent)) {
      offsetDimensions = await platform.getDimensions(offsetParent)
    }

    const side = getSide(placement)
    return {
      x: side === 'left' ? offsetDimensions.width - (x + floatingRect.width) : x,
      y: side === 'top' ? offsetDimensions.height - (y + floatingRect.height) : y,
      data: {
        sideX: side === 'left' ? ('right' as const) : ('left' as const),
        sideY: side === 'top' ? ('bottom' as const) : ('top' as const)
      }
    }
  }
}

export class AnchorPositioning {
  #x = $state(0)
  #y = $state(0)
  #generation = 0
  #placement = $state.raw<Placement | null>(null)
  anchorHidden = $state(false)
  #isPositioned = $state(false)
  arrowX = $state<number | undefined>(undefined)
  arrowY = $state<number | undefined>(undefined)
  arrowUncentered = $state(false)
  arrowElement = $state<Element | null>(null)

  #mountSide = $state<PhysicalSide | null>(null)
  #adaptiveSideData = $state.raw<AdaptiveOriginData>(DEFAULT_ADAPTIVE_ORIGIN)

  #direction = DirectionContext.get()

  #options: () => AnchorPositioningOptions

  constructor(options: () => AnchorPositioningOptions) {
    this.#options = options

    $effect(() => {
      const activeAnchor = this.activeAnchor
      const activeFloating = this.activeFloating
      if (!activeAnchor || !activeFloating) return
      this.update()
    })

    $effect(() => {
      const activeAnchor = this.activeAnchor
      const activeFloating = this.activeFloating
      if (!activeAnchor || !activeFloating) {
        this.#generation += 1
        this.#isPositioned = false
        this.#mountSide = null
        return
      }

      const disableAnchorTracking = this.#disableAnchorTracking
      const autoUpdateOptions = {
        elementResize: !disableAnchorTracking,
        // jsdom has no IntersectionObserver, which autoUpdate's layoutShift tracking requires.
        layoutShift: !disableAnchorTracking && typeof IntersectionObserver !== 'undefined'
      }

      return untrack(() => autoUpdate(activeAnchor, activeFloating, this.update, autoUpdateOptions))
    })
  }

  #disableAnchorTracking = $derived.by(() => this.#options().disableAnchorTracking)

  #isRtl = $derived(this.#direction.direction === 'rtl')

  #sideParam = $derived.by(() => this.#options().side ?? 'bottom')

  #preferredPhysicalSide = $derived(
    this.#mountSide ?? getPhysicalSide(this.#sideParam, this.#isRtl)
  )

  #requestedPlacement = $derived.by<Placement>(() => {
    const align = this.#options().align ?? 'center'
    return align === 'center'
      ? this.#preferredPhysicalSide
      : `${this.#preferredPhysicalSide}-${align}`
  })

  renderedSide = $derived(getSide(this.#placement ?? this.#requestedPlacement))

  side = $derived(getLogicalSide(this.#sideParam, this.renderedSide, this.#isRtl))

  align = $derived(getAlign(this.#placement ?? this.#requestedPlacement))

  activeAnchor = $derived.by(() => {
    const opts = this.#options()
    const a = opts.anchor
    if (isElement(a) && !a.isConnected) return null
    return a ?? null
  })

  activeFloating = $derived.by(() => this.#options().floating)

  positionerStyles = $derived.by((): Record<string, string> => {
    if (!this.#isPositioned) {
      return { position: 'fixed', top: '0', left: '0', opacity: '0' }
    }
    const styles: Record<string, string> = {
      position: this.#options().positionMethod ?? 'absolute'
    }
    if (this.#options().adaptiveOrigin) {
      styles[this.#adaptiveSideData.sideY] = `${this.#y}px`
      styles[this.#adaptiveSideData.sideX] = `${this.#x}px`
    } else {
      const dpr = getDPR(this.#options().floating)
      const round = (value: number) => Math.round(value * dpr) / dpr
      styles.top = '0'
      styles.left = '0'
      styles.transform = `translate(${round(this.#x)}px,${round(this.#y)}px)`
      if (dpr >= 1.5) {
        styles['will-change'] = 'transform'
      }
    }
    return styles
  })

  update = (): void => {
    const opts = this.#options()
    const anchor = opts.anchor
    const floating = opts.floating
    if (!anchor || !floating) return

    const sideParam = opts.side ?? 'bottom'
    const alignParam = opts.align ?? 'center'
    const sideOffsetValue = opts.sideOffset ?? 0
    const alignOffsetValue = opts.alignOffset ?? 0
    const positionMethod = opts.positionMethod ?? 'absolute'
    const collisionAvoidance = opts.collisionAvoidance ?? {}
    const sticky = opts.sticky ?? false
    const arrowPadding = opts.arrowPadding ?? 5
    const shiftCrossAxis = opts.shift?.crossAxis ?? false
    const shiftRootBoundary = opts.shift?.rootBoundary

    const isRtl = this.#isRtl
    const placement = this.#requestedPlacement

    // Biases the preferred side by a single pixel: on iOS, an open software keyboard centres the
    // input exactly in the viewport, and without the bias a tie flips the popup to the other side.
    const bias = 1
    const biasTop = sideParam === 'bottom' ? bias : 0
    const biasRight = sideParam === 'left' ? bias : 0
    const biasBottom = sideParam === 'top' ? bias : 0
    const biasLeft = sideParam === 'right' ? bias : 0
    const collisionPadding = getPaddingObject(opts.collisionPadding ?? 5)

    const boundary =
      opts.collisionBoundary === 'clipping-ancestors'
        ? ('clippingAncestors' as const)
        : opts.collisionBoundary
    const commonCollisionProps = { boundary, padding: collisionPadding }
    const avoidSide = collisionAvoidance.side || 'flip'
    const avoidAlign = collisionAvoidance.align || 'flip'
    const fallbackAxisSide = collisionAvoidance.fallbackAxisSide || 'end'
    const arrowElement = this.arrowElement

    const middleware: (Middleware | null)[] = [
      opts.inline ?? null,
      offset((state) => {
        const data = getOffsetData(state, sideParam, isRtl)
        const mainAxis =
          typeof sideOffsetValue === 'function' ? sideOffsetValue(data) : sideOffsetValue
        const crossAxis =
          typeof alignOffsetValue === 'function' ? alignOffsetValue(data) : alignOffsetValue
        return { mainAxis, crossAxis, alignmentAxis: crossAxis }
      })
    ]

    const flipMw =
      avoidSide === 'none'
        ? null
        : flip({
            ...commonCollisionProps,
            padding: {
              top: collisionPadding.top + bias + biasTop,
              right: collisionPadding.right + bias + biasRight,
              bottom: collisionPadding.bottom + bias + biasBottom,
              left: collisionPadding.left + bias + biasLeft
            },
            mainAxis: !shiftCrossAxis && avoidSide === 'flip',
            crossAxis: avoidAlign === 'flip' ? 'alignment' : false,
            fallbackAxisSideDirection: fallbackAxisSide
          })

    const shiftDisabled = avoidAlign === 'none' && avoidSide !== 'shift'
    const crossAxisShiftEnabled =
      !shiftDisabled && (sticky || shiftCrossAxis || avoidSide === 'shift')

    const shiftMw = shiftDisabled
      ? null
      : shift({
          ...commonCollisionProps,
          rootBoundary: shiftRootBoundary,
          mainAxis: avoidAlign !== 'none',
          crossAxis: crossAxisShiftEnabled,
          limiter:
            sticky || shiftCrossAxis
              ? undefined
              : limitShift((limitData) => {
                  if (!arrowElement) return {}
                  const { width, height } = arrowElement.getBoundingClientRect()
                  const sAxis = getSideAxis(limitData.placement)
                  const arrowSize = sAxis === 'y' ? width : height
                  const offsetAmount =
                    sAxis === 'y'
                      ? collisionPadding.left + collisionPadding.right
                      : collisionPadding.top + collisionPadding.bottom
                  return { offset: arrowSize / 2 + offsetAmount / 2 }
                })
        })

    if (avoidSide === 'shift' || avoidAlign === 'shift' || alignParam === 'center') {
      middleware.push(shiftMw, flipMw)
    } else {
      middleware.push(flipMw, shiftMw)
    }

    middleware.push(
      size({
        ...commonCollisionProps,
        apply({ elements: { floating: applyFloating }, availableWidth, availableHeight, rects }) {
          const floatingStyle = applyFloating.style
          floatingStyle.setProperty('--available-width', `${availableWidth}px`)
          floatingStyle.setProperty('--available-height', `${availableHeight}px`)

          const dpr = getDPR(applyFloating)
          const { x: rx, y: ry, width: rw, height: rh } = rects.reference
          const anchorWidth = (Math.round((rx + rw) * dpr) - Math.round(rx * dpr)) / dpr
          const anchorHeight = (Math.round((ry + rh) * dpr) - Math.round(ry * dpr)) / dpr
          floatingStyle.setProperty('--anchor-width', `${anchorWidth}px`)
          floatingStyle.setProperty('--anchor-height', `${anchorHeight}px`)
        }
      })
    )

    middleware.push(
      arrowMiddleware({
        element: arrowElement || floating.ownerDocument.createElement('div'),
        padding: arrowPadding
      })
    )

    middleware.push(
      transformOriginMiddleware({
        arrowElement,
        crossAxisShiftEnabled,
        getSideOffset: (state) =>
          typeof sideOffsetValue === 'function'
            ? sideOffsetValue(getOffsetData(state, sideParam, isRtl))
            : sideOffsetValue
      }),
      hideMiddleware
    )

    if (opts.adaptiveOrigin) {
      middleware.push(adaptiveOriginMiddleware)
    }

    const generation = this.#generation
    computePosition(anchor, floating, {
      placement,
      strategy: positionMethod,
      middleware: middleware.filter((entry) => entry !== null)
    }).then((result) => {
      if (generation !== this.#generation) return

      this.#x = result.x
      this.#y = result.y
      this.#placement = result.placement
      this.anchorHidden = Boolean(result.middlewareData.hide?.referenceHidden)

      this.#adaptiveSideData =
        (result.middlewareData.adaptiveOrigin as AdaptiveOriginData | undefined) ??
        DEFAULT_ADAPTIVE_ORIGIN

      this.#isPositioned = true

      if (opts.lazyFlip) {
        this.#mountSide = getSide(result.placement)
      }

      if (result.middlewareData.arrow) {
        this.arrowX = result.middlewareData.arrow.x
        this.arrowY = result.middlewareData.arrow.y
        this.arrowUncentered = result.middlewareData.arrow.centerOffset !== 0
      }
    })
  }
}
