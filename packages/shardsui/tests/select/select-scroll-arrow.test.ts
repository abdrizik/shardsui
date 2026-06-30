import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import ScrollArrowItemlessPopup from './fixtures/scroll-arrow-itemless-popup.svelte'
import ScrollArrowNoPopup from './fixtures/scroll-arrow-no-popup.svelte'
import ScrollArrowPopupScroller from './fixtures/scroll-arrow-popup-scroller.svelte'
import ScrollArrowWithoutPositioner from './fixtures/scroll-arrow-without-positioner.svelte'
import ScrollArrows from './fixtures/scroll-arrows.svelte'

function stubScroller(
  node: HTMLElement,
  geometry: { scrollHeight: number; clientHeight: number },
  readScrollTop: () => number,
  onScrollTopChange: (value: number) => void
) {
  Object.defineProperty(node, 'scrollTop', {
    configurable: true,
    get: readScrollTop,
    set: onScrollTopChange
  })
  Object.defineProperty(node, 'scrollHeight', { value: geometry.scrollHeight, configurable: true })
  Object.defineProperty(node, 'clientHeight', { value: geometry.clientHeight, configurable: true })
}

function stubItem(node: HTMLElement, offsetTop: number, offsetHeight: number) {
  Object.defineProperty(node, 'offsetTop', { value: offsetTop, configurable: true })
  Object.defineProperty(node, 'offsetHeight', { value: offsetHeight, configurable: true })
}

const ITEM_OFFSETS = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360]

function renderScrollableSelect(options: {
  initialScrollTop: number
  scrollHeight?: number
  clientHeight?: number
  itemOffsets?: number[]
  itemHeight?: number
}) {
  const {
    initialScrollTop,
    scrollHeight = 400,
    clientHeight = 200,
    itemOffsets = ITEM_OFFSETS,
    itemHeight = 40
  } = options

  let scrollTop = initialScrollTop
  let scrollWrites = 0

  render(ScrollArrows, { labels: itemOffsets.map((_, index) => `Item ${index}`) })

  stubScroller(
    screen.getByRole('listbox'),
    { scrollHeight, clientHeight },
    () => scrollTop,
    (value: number) => {
      scrollWrites += 1
      scrollTop = value
    }
  )

  for (const [index, option] of screen.getAllByRole('option').entries()) {
    stubItem(option, itemOffsets[index], itemHeight)
  }

  const upArrow = screen.getByText('▲')
  const downArrow = screen.getByText('▼')
  Object.defineProperty(upArrow, 'offsetHeight', { value: 0, configurable: true })
  Object.defineProperty(downArrow, 'offsetHeight', { value: 0, configurable: true })

  return {
    upArrow,
    downArrow,
    getScrollTop: () => scrollTop,
    getScrollWrites: () => scrollWrites
  }
}

function renderItemlessPopup(initialScrollTop: number) {
  let scrollTop = initialScrollTop

  render(ScrollArrowItemlessPopup)

  const popup = screen.getByTestId('popup')
  stubScroller(
    popup,
    { scrollHeight: 400, clientHeight: 200 },
    () => scrollTop,
    (value: number) => {
      scrollTop = value
    }
  )

  const up = screen.getByTestId('up')
  const down = screen.getByTestId('down')
  Object.defineProperty(up, 'offsetHeight', { value: 0, configurable: true })
  Object.defineProperty(down, 'offsetHeight', { value: 0, configurable: true })

  return { popup, up, down }
}

describe('<Select.ScrollUpArrow /> / <Select.ScrollDownArrow />', () => {
  it('does not start auto-scrolling for a mouse move that did not move the pointer', async () => {
    vi.useFakeTimers()
    try {
      const { downArrow, getScrollTop } = renderScrollableSelect({ initialScrollTop: 0 })

      fireEvent.mouseMove(downArrow, { movementX: 0, movementY: 0 })
      vi.advanceTimersByTime(400)

      expect(getScrollTop()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not let continuous pointer movement postpone the scheduled scroll', async () => {
    vi.useFakeTimers()
    try {
      const { downArrow, getScrollTop } = renderScrollableSelect({ initialScrollTop: 0 })

      fireEvent.mouseMove(downArrow, { movementX: 0, movementY: 1 })
      vi.advanceTimersByTime(30)

      fireEvent.mouseMove(downArrow, { movementX: 1, movementY: 1 })
      vi.advanceTimersByTime(15)

      expect(getScrollTop()).toBeGreaterThan(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('stops auto-scrolling once the pointer leaves the arrow', async () => {
    vi.useFakeTimers()
    try {
      const { downArrow, getScrollTop } = renderScrollableSelect({ initialScrollTop: 0 })

      fireEvent.mouseMove(downArrow, { movementX: 0, movementY: 1 })
      vi.advanceTimersByTime(40)

      const scrollTopAfterFirstStep = getScrollTop()
      expect(scrollTopAfterFirstStep).toBeGreaterThan(0)

      fireEvent.mouseLeave(downArrow)
      vi.advanceTimersByTime(400)

      expect(getScrollTop()).toBe(scrollTopAfterFirstStep)
    } finally {
      vi.useRealTimers()
    }
  })

  it('snaps a sub-pixel offset to the exact top edge and then stops scrolling', async () => {
    vi.useFakeTimers()
    try {
      const { upArrow, getScrollTop, getScrollWrites } = renderScrollableSelect({
        initialScrollTop: 0.4
      })

      fireEvent.mouseMove(upArrow, { movementX: 0, movementY: -1 })
      vi.advanceTimersByTime(40)

      expect(getScrollTop()).toBe(0)

      const writesAtEdge = getScrollWrites()
      vi.advanceTimersByTime(400)

      expect(getScrollTop()).toBe(0)
      expect(getScrollWrites()).toBe(writesAtEdge)
    } finally {
      vi.useRealTimers()
    }
  })

  it('scrolls to the bottom when trailing content extends past the last item', async () => {
    vi.useFakeTimers()
    try {
      const { downArrow, getScrollTop } = renderScrollableSelect({
        initialScrollTop: 390,
        scrollHeight: 600,
        clientHeight: 200
      })

      fireEvent.mouseMove(downArrow, { movementX: 0, movementY: 1 })
      vi.advanceTimersByTime(40)

      expect(getScrollTop()).toBe(400)
    } finally {
      vi.useRealTimers()
    }
  })

  it('scrolls to the very top when no earlier item remains to land on', async () => {
    vi.useFakeTimers()
    try {
      const { upArrow, getScrollTop } = renderScrollableSelect({
        initialScrollTop: 100,
        scrollHeight: 600,
        clientHeight: 200,
        itemOffsets: [300, 340, 380]
      })

      fireEvent.mouseMove(upArrow, { movementX: 0, movementY: -1 })
      vi.advanceTimersByTime(40)

      expect(getScrollTop()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('scrolls the popup itself when no list is rendered', async () => {
    vi.useFakeTimers()
    try {
      let scrollTop = 0

      render(ScrollArrowPopupScroller, {
        labels: ITEM_OFFSETS.map((_, index) => `Item ${index}`)
      })

      stubScroller(
        screen.getByTestId('popup'),
        { scrollHeight: 400, clientHeight: 200 },
        () => scrollTop,
        (value: number) => {
          scrollTop = value
        }
      )

      for (const [index, option] of screen.getAllByRole('option').entries()) {
        stubItem(option, ITEM_OFFSETS[index], 40)
      }

      const down = screen.getByTestId('down')
      Object.defineProperty(down, 'offsetHeight', { value: 0, configurable: true })

      fireEvent.mouseMove(down, { movementX: 0, movementY: 1 })
      vi.advanceTimersByTime(40)

      expect(scrollTop).toBeGreaterThan(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reflects scrollability on the down arrow when the popup has no registered items', async () => {
    const { down } = renderItemlessPopup(100)

    fireEvent.mouseMove(down, { movementX: 0, movementY: 1 })

    await waitFor(() => {
      expect(down).toHaveAttribute('data-visible')
    })
  })

  it('reflects scrollability on the up arrow when the popup has no registered items', async () => {
    const { up } = renderItemlessPopup(100)

    fireEvent.mouseMove(up, { movementX: 0, movementY: -1 })

    await waitFor(() => {
      expect(up).toHaveAttribute('data-visible')
    })
  })

  it('hides the arrow when an item-less popup is already scrolled to its edge', async () => {
    const { down, up } = renderItemlessPopup(200)

    fireEvent.mouseMove(down, { movementX: 0, movementY: 1 })

    await waitFor(() => {
      expect(up).toHaveAttribute('data-visible')
    })
    expect(down).not.toHaveAttribute('data-visible')
  })

  it('ignores pointer interaction when the arrow has no scrollable popup', async () => {
    vi.useFakeTimers()
    try {
      render(ScrollArrowNoPopup)

      const down = screen.getByTestId('down')
      fireEvent.mouseMove(down, { movementX: 0, movementY: 1 })

      expect(() => vi.advanceTimersByTime(400)).not.toThrow()
    } finally {
      vi.useRealTimers()
    }
  })

  it('normalizes overlapping fractional scroll ranges when toggling scroll arrow visibility', async () => {
    let scrollTop = 0.4

    render(ScrollArrows, { labels: ['One', 'Two', 'Three'] })

    const list = screen.getByRole('listbox')
    Object.defineProperty(list, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = value
      }
    })
    Object.defineProperty(list, 'scrollHeight', { value: 60.6, configurable: true })
    Object.defineProperty(list, 'clientHeight', { value: 60, configurable: true })

    const upArrow = screen.getByText('▲')
    const downArrow = screen.getByText('▼')

    await fireEvent.scroll(list)

    await waitFor(() => {
      expect(upArrow).toHaveAttribute('data-visible')
    })
    expect(downArrow).not.toHaveAttribute('data-visible')

    scrollTop = 0.2
    await fireEvent.scroll(list)

    await waitFor(() => {
      expect(upArrow).not.toHaveAttribute('data-visible')
    })
    expect(downArrow).toHaveAttribute('data-visible')
  })

  it('snaps hover scrolling to the true bottom when the remaining space is fractional', async () => {
    let scrollTop = 19.5

    vi.useFakeTimers()
    try {
      render(ScrollArrows, { labels: ['One', 'Two', 'Three'] })

      const list = screen.getByRole('listbox')
      Object.defineProperty(list, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value
        }
      })
      Object.defineProperty(list, 'scrollHeight', { value: 100.5, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 60, configurable: true })

      const options = screen.getAllByRole('option')
      options.forEach((option, index) => {
        Object.defineProperty(option, 'offsetTop', { value: index * 40, configurable: true })
        Object.defineProperty(option, 'offsetHeight', { value: 20, configurable: true })
      })

      const arrow = screen.getByText('▼')
      Object.defineProperty(arrow, 'offsetHeight', { value: 0, configurable: true })

      fireEvent.mouseMove(arrow, { movementX: 0, movementY: 1 })
      vi.advanceTimersByTime(40)

      expect(scrollTop).toBe(40.5)
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps advancing when the next item bottom is fractionally within the visible bottom', async () => {
    let scrollTop = 71.81818389892578

    vi.useFakeTimers()
    try {
      const offsets = [32, 64, 96, 128, 160, 192, 224, 256, 336, 368, 400, 432, 448, 480, 512, 544]
      render(ScrollArrows, { labels: offsets.map((_, i) => `Item ${i}`) })

      const list = screen.getByRole('listbox')
      Object.defineProperty(list, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value
        }
      })
      Object.defineProperty(list, 'scrollHeight', { value: 598, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 440, configurable: true })

      const options = screen.getAllByRole('option')
      options.forEach((option, index) => {
        Object.defineProperty(option, 'offsetTop', { value: offsets[index], configurable: true })
        Object.defineProperty(option, 'offsetHeight', { value: 32, configurable: true })
      })

      const arrow = screen.getByText('▼')
      Object.defineProperty(arrow, 'offsetHeight', { value: 0, configurable: true })

      fireEvent.mouseMove(arrow, { movementX: 0, movementY: 1 })
      vi.advanceTimersByTime(40)

      expect(scrollTop).toBe(104)
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps advancing when the previous item top is fractionally within the visible top (scroll-up)', async () => {
    let scrollTop = 72.18181610107422

    vi.useFakeTimers()
    try {
      const offsets = [32, 71.5, 110, 142]
      render(ScrollArrows, { labels: offsets.map((_, i) => `Item ${i}`) })

      const list = screen.getByRole('listbox')
      Object.defineProperty(list, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value
        }
      })
      Object.defineProperty(list, 'scrollHeight', { value: 598, configurable: true })
      Object.defineProperty(list, 'clientHeight', { value: 440, configurable: true })

      const options = screen.getAllByRole('option')
      options.forEach((option, index) => {
        Object.defineProperty(option, 'offsetTop', { value: offsets[index], configurable: true })
        Object.defineProperty(option, 'offsetHeight', { value: 32, configurable: true })
      })

      const arrow = screen.getByText('▲')
      Object.defineProperty(arrow, 'offsetHeight', { value: 0, configurable: true })

      fireEvent.mouseMove(arrow, { movementX: 0, movementY: -1 })
      vi.advanceTimersByTime(40)

      expect(scrollTop).toBe(32)
    } finally {
      vi.useRealTimers()
    }
  })

  it('throws when rendered outside a positioner', () => {
    expect(() => render(ScrollArrowWithoutPositioner)).toThrow(/Select\.Positioner/)
  })
})
