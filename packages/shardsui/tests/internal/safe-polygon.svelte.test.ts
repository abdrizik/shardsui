import { FloatingTree } from '$lib/internal/floating/floating-tree.svelte'
import type { CloseGuard } from '$lib/internal/floating/hover/predicates'
import { safePolygon } from '$lib/internal/floating/safe-polygon.svelte'
import { flushSync } from 'svelte'
import { expect, it, vi } from 'vitest'

type Side = 'top' | 'bottom' | 'left' | 'right'

function createRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON() {
      return this
    }
  } satisfies DOMRect
}

function createMouseMoveEvent(
  clientX: number,
  clientY: number,
  target: EventTarget | null = null
): MouseEvent {
  return {
    type: 'mousemove',
    clientX,
    clientY,
    relatedTarget: null,
    composedPath: () => [target]
  } as unknown as MouseEvent
}

function createSideScenario(side: Side) {
  const referenceRect = createRect(0, 0, 100, 100)

  switch (side) {
    case 'top':
      return {
        referenceRect,
        floatingRect: createRect(0, -120, 100, 100),
        leavePoint: [50, 0] as const,
        troughPoint: [50, -10] as const,
        outsidePoint: [50, 150] as const
      }
    case 'bottom':
      return {
        referenceRect,
        floatingRect: createRect(0, 120, 100, 100),
        leavePoint: [50, 100] as const,
        troughPoint: [50, 110] as const,
        outsidePoint: [50, -50] as const
      }
    case 'left':
      return {
        referenceRect,
        floatingRect: createRect(-120, 0, 100, 100),
        leavePoint: [0, 50] as const,
        troughPoint: [-10, 50] as const,
        outsidePoint: [150, 50] as const
      }
    case 'right':
    default:
      return {
        referenceRect,
        floatingRect: createRect(120, 0, 100, 100),
        leavePoint: [100, 50] as const,
        troughPoint: [110, 50] as const,
        outsidePoint: [-50, 50] as const
      }
  }
}

function withGuard(run: (guard: CloseGuard) => void) {
  const cleanup = $effect.root(() => {
    const guard = safePolygon()
    flushSync()
    run(guard)
  })
  cleanup()
}

describe('safePolygon', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not close when a nested child is open', () => {
    const domReference = document.createElement('button')
    const floating = document.createElement('div')
    domReference.getBoundingClientRect = () => createRect(0, 0, 100, 100)
    floating.getBoundingClientRect = () => createRect(120, 0, 100, 100)

    const tree = new FloatingTree()
    const onClose = vi.fn()

    tree.addNode({ id: 'child', parentId: 'root', open: true })

    withGuard((guard) => {
      const handler = guard({
        x: 2,
        y: 0,
        side: 'right',
        elements: { domReference, floating },
        onClose,
        nodeId: 'root',
        tree
      })
      handler(createMouseMoveEvent(3, -1))
      vi.advanceTimersByTime(50)
      flushSync()
    })

    expect(onClose).toHaveBeenCalledTimes(0)
  })

  it('does not close when an open nested child is behind a contextless intermediary node', () => {
    const domReference = document.createElement('button')
    const floating = document.createElement('div')
    domReference.getBoundingClientRect = () => createRect(0, 0, 100, 100)
    floating.getBoundingClientRect = () => createRect(120, 0, 100, 100)

    const tree = new FloatingTree()
    const onClose = vi.fn()

    tree.addNode({ id: 'inline-root', parentId: 'root' })
    tree.addNode({ id: 'child', parentId: 'inline-root', open: true })

    withGuard((guard) => {
      const handler = guard({
        x: 2,
        y: 0,
        side: 'right',
        elements: { domReference, floating },
        onClose,
        nodeId: 'root',
        tree
      })
      handler(createMouseMoveEvent(3, -1))
      vi.advanceTimersByTime(50)
      flushSync()
    })

    expect(onClose).toHaveBeenCalledTimes(0)
  })

  it('closes after intent timeout when no nested child is open', () => {
    const domReference = document.createElement('button')
    const floating = document.createElement('div')
    domReference.getBoundingClientRect = () => createRect(0, 0, 100, 100)
    floating.getBoundingClientRect = () => createRect(120, 0, 100, 100)

    const tree = new FloatingTree()
    const onClose = vi.fn()

    tree.addNode({ id: 'child', parentId: 'root', open: false })

    withGuard((guard) => {
      const handler = guard({
        x: 2,
        y: 0,
        side: 'right',
        elements: { domReference, floating },
        onClose,
        nodeId: 'root',
        tree
      })
      handler(createMouseMoveEvent(3, -1))
      vi.advanceTimersByTime(50)
      flushSync()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'keeps open while moving through the trough on %s side',
    (side) => {
      const domReference = document.createElement('button')
      const floating = document.createElement('div')
      const scenario = createSideScenario(side)

      domReference.getBoundingClientRect = () => scenario.referenceRect
      floating.getBoundingClientRect = () => scenario.floatingRect

      const tree = new FloatingTree()
      const onClose = vi.fn()

      withGuard((guard) => {
        const handler = guard({
          x: scenario.leavePoint[0],
          y: scenario.leavePoint[1],
          side,
          elements: { domReference, floating },
          onClose,
          nodeId: 'root',
          tree
        })
        handler(createMouseMoveEvent(scenario.troughPoint[0], scenario.troughPoint[1]))
      })

      expect(onClose).toHaveBeenCalledTimes(0)
    }
  )

  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'closes when moving away from corridor on %s side',
    (side) => {
      const domReference = document.createElement('button')
      const floating = document.createElement('div')
      const scenario = createSideScenario(side)

      domReference.getBoundingClientRect = () => scenario.referenceRect
      floating.getBoundingClientRect = () => scenario.floatingRect

      const tree = new FloatingTree()
      const onClose = vi.fn()

      withGuard((guard) => {
        const handler = guard({
          x: scenario.leavePoint[0],
          y: scenario.leavePoint[1],
          side,
          elements: { domReference, floating },
          onClose,
          nodeId: 'root',
          tree
        })
        handler(createMouseMoveEvent(scenario.outsidePoint[0], scenario.outsidePoint[1]))
      })

      expect(onClose).toHaveBeenCalledTimes(1)
    }
  )

  it('resets traversal state for a new handler invocation', () => {
    const domReference = document.createElement('button')
    const floating = document.createElement('div')
    const scenario = createSideScenario('right')

    domReference.getBoundingClientRect = () => scenario.referenceRect
    floating.getBoundingClientRect = () => scenario.floatingRect

    const tree = new FloatingTree()
    const onClose = vi.fn()

    withGuard((guard) => {
      const context: Parameters<CloseGuard>[0] = {
        x: scenario.leavePoint[0],
        y: scenario.leavePoint[1],
        side: 'right',
        elements: { domReference, floating },
        onClose,
        nodeId: 'root',
        tree
      }
      const firstHandler = guard(context)
      firstHandler(createMouseMoveEvent(130, 50, floating))

      const secondHandler = guard(context)
      secondHandler(createMouseMoveEvent(scenario.troughPoint[0], scenario.troughPoint[1]))
    })

    expect(onClose).toHaveBeenCalledTimes(0)
  })
})
