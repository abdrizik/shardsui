import { Popover } from '$lib/components/popover'
import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'
import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import PopoverViewportAnchoring from './fixtures/popover-viewport-anchoring.svelte'
import PopoverViewportMorph from './fixtures/popover-viewport-morph.svelte'
import PopoverViewportMulti from './fixtures/popover-viewport-multi.svelte'
import PopoverViewportRapid from './fixtures/popover-viewport-rapid.svelte'
import PopoverWithViewport from './fixtures/popover-with-viewport.svelte'

describe('<Popover.Viewport />', () => {
  const anchoringCases: {
    side: Side
    direction: 'ltr' | 'rtl'
    expected: Partial<Record<'position' | 'top' | 'right' | 'bottom' | 'left', string>>
  }[] = [
    {
      side: 'top',
      direction: 'ltr',
      expected: { position: 'absolute', bottom: '0px', left: '0px' }
    },
    {
      side: 'top',
      direction: 'rtl',
      expected: { position: 'absolute', bottom: '0px', left: '0px' }
    },
    { side: 'bottom', direction: 'ltr', expected: {} },
    { side: 'bottom', direction: 'rtl', expected: {} },
    {
      side: 'left',
      direction: 'ltr',
      expected: { position: 'absolute', top: '0px', right: '0px' }
    },
    {
      side: 'left',
      direction: 'rtl',
      expected: { position: 'absolute', top: '0px', right: '0px' }
    },
    { side: 'right', direction: 'ltr', expected: {} },
    { side: 'right', direction: 'rtl', expected: {} },
    {
      side: 'inline-start',
      direction: 'ltr',
      expected: { position: 'absolute', top: '0px', right: '0px' }
    },
    { side: 'inline-start', direction: 'rtl', expected: {} },
    { side: 'inline-end', direction: 'ltr', expected: {} },
    {
      side: 'inline-end',
      direction: 'rtl',
      expected: { position: 'absolute', top: '0px', right: '0px' }
    }
  ]

  it.each(anchoringCases)(
    'anchors side=$side correctly in $direction mode',
    async ({ side, direction, expected }) => {
      render(PopoverViewportAnchoring, { side, direction })

      const { style } = screen.getByTestId('popup')
      await waitFor(() => expect(style.position).toBe(expected.position ?? ''))
      expect(style.top).toBe(expected.top ?? '')
      expect(style.right).toBe(expected.right ?? '')
      expect(style.bottom).toBe(expected.bottom ?? '')
      expect(style.left).toBe(expected.left ?? '')
    }
  )

  it('renders children inside a [data-current] container', async () => {
    const user = userEvent.setup()
    render(PopoverWithViewport, { open: false })

    await user.click(screen.getByTestId('trigger'))

    const content = screen.getByTestId('content')
    const currentContainer = content.closest('[data-current]')
    expect(currentContainer).not.toBeNull()
    expect(currentContainer!.textContent).toBe('Content')
  })

  describe('multiple triggers', () => {
    it('remounts the `current` container when the active trigger changes', async () => {
      const handle = new Popover.Handle<string>()
      render(PopoverViewportMulti, { handle })
      await tick()

      handle.open('trigger-1')
      await tick()
      await waitFor(() => expect(screen.getByTestId('payload-1')).toBeInTheDocument())
      const firstContainer = screen.getByTestId('payload-1').closest('[data-current]')
      expect(firstContainer).not.toBeNull()

      handle.open('trigger-2')
      await tick()
      await waitFor(() => {
        const secondContainer = screen.getByTestId('payload-2').closest('[data-current]')
        expect(secondContainer).not.toBeNull()
        expect(secondContainer).not.toBe(firstContainer)
      })
    })
  })

  describe.skipIf(isJSDOM)('morphing containers', () => {
    let previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED

    beforeEach(() => {
      previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    afterEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    })

    it('marks the previous container inert and removes it after the transition', async () => {
      const user = userEvent.setup()
      render(PopoverViewportMorph)

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      await user.click(screen.getByTestId('trigger2'))

      let previousContainer: HTMLElement | null = null
      await waitFor(() => {
        previousContainer = document.querySelector('[data-previous]')
        expect(previousContainer).not.toBeNull()
      })

      expect(previousContainer!).toHaveAttribute('inert')
      expect(previousContainer!.textContent).toBe('Content 0')

      const nextContainer = document.querySelector('[data-current]')
      expect(nextContainer).not.toBeNull()
      expect(nextContainer!.textContent).toBe('Content 1')

      await waitFor(() => expect(document.querySelector('[data-previous]')).toBeNull())

      expect(document.querySelector('[data-current]')).toBeVisible()
      expect(screen.getByText('Content 1')).toBeVisible()
    })

    it('morphs again after a kept-mounted popup closes and reopens', async () => {
      const user = userEvent.setup()
      render(PopoverViewportMorph, { keepMounted: true })

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      await user.click(screen.getByTestId('trigger2'))
      await waitFor(() => expect(document.querySelector('[data-previous]')).not.toBeNull())
      await waitFor(() => expect(document.querySelector('[data-previous]')).toBeNull())

      await user.click(screen.getByTestId('close-external'))
      await waitFor(() => expect(screen.getByTestId('popup')).not.toBeVisible())

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      await user.click(screen.getByTestId('trigger2'))

      let previousContainer: HTMLElement | null = null
      await waitFor(() => {
        previousContainer = document.querySelector('[data-previous]')
        expect(previousContainer).not.toBeNull()
      })

      expect(previousContainer!.textContent).toBe('Content 0')
      await waitFor(() => expect(screen.getByText('Content 1')).toBeVisible())
    })

    it('settles on the last trigger after rapid trigger changes', async () => {
      const user = userEvent.setup()
      render(PopoverViewportRapid)

      await user.click(screen.getByTestId('trigger1'))
      await user.click(screen.getByTestId('trigger2'))
      await user.click(screen.getByTestId('trigger3'))
      await user.click(screen.getByTestId('trigger1'))

      const content = await screen.findByText('Content 1')
      await waitFor(() => expect(content).toBeVisible())
    })

    it.each([
      {
        name: 'right down',
        trigger1: { top: 10, left: 10 },
        trigger2: { top: 100, left: 200 },
        expected: ['right', 'down']
      },
      {
        name: 'left up',
        trigger1: { top: 100, left: 200 },
        trigger2: { top: 10, left: 10 },
        expected: ['left', 'up']
      },
      {
        name: 'right (horizontal only)',
        trigger1: { top: 50, left: 10 },
        trigger2: { top: 52, left: 200 },
        expected: ['right']
      },
      {
        name: 'down (vertical only)',
        trigger1: { top: 10, left: 50 },
        trigger2: { top: 100, left: 52 },
        expected: ['down']
      },
      {
        name: 'none within tolerance',
        trigger1: { top: 50, left: 50 },
        trigger2: { top: 52, left: 52 },
        expected: []
      },
      {
        name: 'left down',
        trigger1: { top: 10, left: 200 },
        trigger2: { top: 100, left: 10 },
        expected: ['left', 'down']
      },
      {
        name: 'right up',
        trigger1: { top: 100, left: 10 },
        trigger2: { top: 10, left: 200 },
        expected: ['right', 'up']
      }
    ])('exposes data-activation-direction: $name', async ({ trigger1, trigger2, expected }) => {
      const user = userEvent.setup()
      render(PopoverViewportMorph, { trigger1, trigger2 })

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      await user.click(screen.getByTestId('trigger2'))

      const viewport = screen.getByTestId('viewport')
      await waitFor(() => expect(viewport).toHaveAttribute('data-activation-direction'))

      const direction = viewport.getAttribute('data-activation-direction')

      if (expected.length === 0) {
        expect(direction?.trim()).toBe('')
      } else {
        for (const dir of expected) {
          expect(direction).toContain(dir)
        }
      }
    })
  })
})
