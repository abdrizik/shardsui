import {
  createInlineMiddleware,
  getInlineRectCoords,
  type InlineRectCoords
} from '$lib/internal/floating/inline-rect'
import {
  detectOverflow,
  type MiddlewareState,
  type Placement,
  type ReferenceElement
} from '@floating-ui/dom'
import { describe, expect, it, vi } from 'vitest'

type RectLike = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

function createTrigger(rects: RectLike[] | (() => RectLike[])) {
  const trigger = document.createElement('span')
  Object.defineProperty(trigger, 'getClientRects', {
    value: () => (rects instanceof Function ? rects() : rects)
  })
  return trigger
}

function toClientRect(rect: RectLike) {
  return { ...rect, x: rect.left, y: rect.top }
}

function createMiddlewareState(
  reference: ReferenceElement,
  placement: Placement,
  referenceRect: { x: number; y: number; width: number; height: number },
  options?: {
    getElementRects?: (
      rect: RectLike & { x: number; y: number },
      contextElement: Element | undefined
    ) => { x: number; y: number; width: number; height: number }
  }
): MiddlewareState {
  const floatingRect = { x: 0, y: 0, width: 20, height: 10 }

  return {
    x: 0,
    y: 0,
    initialPlacement: placement,
    placement,
    strategy: 'absolute',
    middlewareData: {},
    elements: { reference, floating: document.createElement('div') },
    rects: {
      reference: referenceRect,
      floating: floatingRect
    },
    platform: {
      detectOverflow,
      getClippingRect: () => ({ x: 0, y: 0, width: 0, height: 0 }),
      getDimensions: () => ({ width: 0, height: 0 }),
      getElementRects: async ({ reference: positioningReference }) => {
        const contextElement =
          'contextElement' in positioningReference ? positioningReference.contextElement : undefined
        const rect = positioningReference.getBoundingClientRect()
        return {
          reference: options?.getElementRects
            ? options.getElementRects(rect, contextElement)
            : { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          floating: floatingRect
        }
      }
    }
  }
}

describe('inlineRect', () => {
  it('returns undefined when the trigger does not wrap', () => {
    const trigger = createTrigger([
      { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }
    ])

    expect(getInlineRectCoords(trigger, 5, 5)).toBeUndefined()
  })

  it('captures coords and the hovered line index', () => {
    const trigger = createTrigger([
      { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 },
      { left: 0, top: 20, right: 10, bottom: 30, width: 10, height: 10 }
    ])

    expect(getInlineRectCoords(trigger, 5, 25)).toEqual({
      x: 5,
      y: 25,
      lineIndex: 1,
      trigger
    })
  })

  it('creates inline middleware rects from the hovered line', async () => {
    const rects: RectLike[] = [
      { left: 0, top: 0, right: 80, bottom: 10, width: 80, height: 10 },
      { left: 0, top: 20, right: 80, bottom: 30, width: 80, height: 10 },
      { left: 0, top: 40, right: 80, bottom: 50, width: 80, height: 10 }
    ]
    const trigger = createTrigger(rects)
    const middleware = createInlineMiddleware(() => ({
      x: 2,
      y: 23,
      lineIndex: 1,
      trigger
    }))

    expect(
      await middleware.fn?.(
        createMiddlewareState(trigger, 'bottom', { x: 0, y: 0, width: 10, height: 10 })
      )
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[1].left,
            y: rects[1].top,
            width: rects[1].width,
            height: rects[1].height
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })
  })

  it('reuses the captured line index if client coordinates become stale', async () => {
    let rects: RectLike[] = [
      { left: 80, top: 0, right: 120, bottom: 10, width: 40, height: 10 },
      { left: 0, top: 20, right: 60, bottom: 30, width: 60, height: 10 }
    ]
    const trigger = createTrigger(() => rects)
    const coords: InlineRectCoords | undefined = getInlineRectCoords(trigger, 100, 5)

    rects = [
      { left: 80, top: 100, right: 120, bottom: 110, width: 40, height: 10 },
      { left: 0, top: 120, right: 60, bottom: 130, width: 60, height: 10 }
    ]

    expect(
      await createInlineMiddleware(() => coords).fn?.(
        createMiddlewareState(trigger, 'bottom', { x: 0, y: 100, width: 120, height: 30 })
      )
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[0].left,
            y: rects[0].top,
            width: rects[0].width,
            height: rects[0].height
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })
  })

  it('uses the edge-aligned rect for right placements', async () => {
    const rects: RectLike[] = [
      { left: 0, top: 0, right: 40, bottom: 10, width: 40, height: 10 },
      { left: 0, top: 20, right: 60, bottom: 30, width: 60, height: 10 },
      { left: 20, top: 40, right: 60, bottom: 50, width: 40, height: 10 }
    ]
    const trigger = createTrigger(rects)
    const middleware = createInlineMiddleware(() => undefined)

    expect(
      await middleware.fn?.(
        createMiddlewareState(trigger, 'right', { x: 0, y: 0, width: 60, height: 50 })
      )
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[0].left,
            y: rects[1].top,
            width: rects[1].right - rects[0].left,
            height: rects[2].bottom - rects[1].top
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })
  })

  it('uses the edge-aligned rect for left placements', async () => {
    const rects: RectLike[] = [
      { left: 20, top: 0, right: 60, bottom: 10, width: 40, height: 10 },
      { left: 0, top: 20, right: 60, bottom: 30, width: 60, height: 10 },
      { left: 0, top: 40, right: 40, bottom: 50, width: 40, height: 10 }
    ]
    const trigger = createTrigger(rects)
    const middleware = createInlineMiddleware(() => undefined)

    expect(
      await middleware.fn?.(
        createMiddlewareState(trigger, 'left', { x: 0, y: 0, width: 60, height: 50 })
      )
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[1].left,
            y: rects[1].top,
            width: rects[1].right - rects[1].left,
            height: rects[2].bottom - rects[1].top
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })
  })

  it('uses the fallback rect for disjoint two-line rects when coords miss', async () => {
    const rects: RectLike[] = [
      { left: 80, top: 0, right: 120, bottom: 10, width: 40, height: 10 },
      { left: 0, top: 20, right: 60, bottom: 30, width: 60, height: 10 }
    ]
    const trigger = createTrigger(rects)

    expect(
      await createInlineMiddleware(() => ({
        x: 200,
        y: 200,
        lineIndex: undefined,
        trigger
      })).fn?.(createMiddlewareState(trigger, 'bottom', { x: 80, y: 0, width: 40, height: 30 }))
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[1].left,
            y: rects[0].top,
            width: rects[0].right - rects[1].left,
            height: rects[1].bottom - rects[0].top
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })
  })

  it('does not create inline rects when the reference does not wrap', async () => {
    const trigger = createTrigger([
      { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }
    ])

    expect(
      await createInlineMiddleware(() => undefined).fn?.(
        createMiddlewareState(trigger, 'bottom', { x: 0, y: 0, width: 10, height: 10 })
      )
    ).toEqual({})
  })

  it('does not run when the reference has no client rects', async () => {
    const reference = {
      getBoundingClientRect: () =>
        toClientRect({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 })
    }
    const state = createMiddlewareState(reference, 'bottom', {
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    expect(await createInlineMiddleware(() => undefined).fn?.(state)).toEqual({})
  })

  it('does not reset when the inline rect matches the current reference rect', async () => {
    const rects: RectLike[] = [
      { left: 0, top: 0, right: 80, bottom: 10, width: 80, height: 10 },
      { left: 0, top: 20, right: 80, bottom: 30, width: 80, height: 10 }
    ]
    const trigger = createTrigger(rects)

    expect(
      await createInlineMiddleware(() => ({
        x: 2,
        y: 23,
        lineIndex: 1,
        trigger
      })).fn?.(
        createMiddlewareState(trigger, 'bottom', {
          x: rects[1].left,
          y: rects[1].top,
          width: rects[1].width,
          height: rects[1].height
        })
      )
    ).toEqual({})
  })

  it('ignores stored coords from a different element', async () => {
    const previousTrigger = createTrigger([
      { left: 80, top: 0, right: 120, bottom: 10, width: 40, height: 10 },
      { left: 0, top: 20, right: 60, bottom: 30, width: 60, height: 10 }
    ])
    const rects: RectLike[] = [
      { left: 80, top: 100, right: 120, bottom: 110, width: 40, height: 10 },
      { left: 0, top: 120, right: 60, bottom: 130, width: 60, height: 10 }
    ]
    const trigger = createTrigger(rects)
    const middleware = createInlineMiddleware(() => ({
      x: 100,
      y: 5,
      lineIndex: 0,
      trigger: previousTrigger
    }))

    expect(
      await middleware.fn?.(
        createMiddlewareState(trigger, 'bottom', { x: 0, y: 100, width: 120, height: 30 })
      )
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[1].left,
            y: rects[0].top,
            width: rects[1].width,
            height: rects[1].bottom - rects[0].top
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })
  })

  it('accepts stored coords from a virtual reference context element', async () => {
    const rects: RectLike[] = [
      { left: 80, top: 0, right: 120, bottom: 10, width: 40, height: 10 },
      { left: 0, top: 20, right: 60, bottom: 30, width: 60, height: 10 }
    ]
    const trigger = createTrigger(rects)
    const reference = {
      contextElement: trigger,
      getBoundingClientRect: () => toClientRect(rects[0]),
      getClientRects: () => rects.map(toClientRect)
    }
    const middleware = createInlineMiddleware(() => ({
      x: 100,
      y: 5,
      lineIndex: 0,
      trigger
    }))

    expect(
      await middleware.fn?.(
        createMiddlewareState(reference, 'bottom', { x: 0, y: 0, width: 120, height: 30 })
      )
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[0].left,
            y: rects[0].top,
            width: rects[0].width,
            height: rects[0].height
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })
  })

  it('converts client-space inline rects through the positioning platform', async () => {
    const rects: RectLike[] = [
      { left: 140, top: 300, right: 180, bottom: 310, width: 40, height: 10 },
      { left: 100, top: 320, right: 180, bottom: 330, width: 80, height: 10 }
    ]
    const trigger = createTrigger(rects)
    const getElementRects = vi.fn((rect: RectLike & { x: number; y: number }) => ({
      x: rect.x,
      y: rect.y + 500,
      width: rect.width,
      height: rect.height
    }))
    const middleware = createInlineMiddleware(() => undefined)

    expect(
      await middleware.fn?.(
        createMiddlewareState(
          trigger,
          'top',
          { x: 100, y: 800, width: 80, height: 30 },
          { getElementRects }
        )
      )
    ).toEqual({
      reset: {
        rects: {
          reference: {
            x: rects[0].left,
            y: rects[0].top + 500,
            width: rects[0].width,
            height: rects[1].bottom - rects[0].top
          },
          floating: { x: 0, y: 0, width: 20, height: 10 }
        }
      }
    })

    expect(getElementRects).toHaveBeenCalledOnce()
  })
})
