import { Tooltip } from '$lib/components/tooltip'
import { render, screen, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import TooltipViewportContent from './fixtures/tooltip-viewport-content.svelte'
import TooltipViewportMulti from './fixtures/tooltip-viewport-multi.svelte'
import ViewportDirection from './fixtures/viewport-direction.svelte'
import ViewportInstant from './fixtures/viewport-instant.svelte'
import ViewportMorph from './fixtures/viewport-morph.svelte'
import ViewportRapid from './fixtures/viewport-rapid.svelte'

async function waitSingleFrame() {
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

describe('<Tooltip.Viewport />', () => {
  it('renders children in the `current` container by default', async () => {
    render(TooltipViewportContent, { open: true })

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    const currentContainer = screen.getByTestId('content').closest('[data-current]')
    expect(currentContainer).not.toBeNull()
    expect(currentContainer!.textContent).toBe('Content')
  })

  it.skipIf(isJSDOM)('mirrors the instant animation type of the tooltip', async () => {
    render(ViewportInstant)

    screen.getByTestId('trigger').focus()

    await waitFor(() => {
      expect(screen.getByTestId('viewport')).toHaveAttribute('data-instant', 'focus')
    })
  })

  it('remounts the `current` container when the active trigger changes', async () => {
    const handle = new Tooltip.Handle<string>()
    render(TooltipViewportMulti, { handle })
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

  describe.skipIf(isJSDOM)('Viewport', () => {
    it('keeps the latest transition active during rapid trigger changes', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        render(ViewportRapid)

        const trigger1 = screen.getByTestId('trigger1')
        const trigger2 = screen.getByTestId('trigger2')
        const trigger3 = screen.getByTestId('trigger3')

        trigger1.focus()
        await waitSingleFrame()
        trigger2.focus()

        await waitFor(() => {
          const container = screen.getByText('Content 2').closest('[data-current]')
          expect(container?.getAnimations().length).toBe(1)
        })
        await waitSingleFrame()

        trigger3.focus()
        await waitSingleFrame()

        const currentContainer = screen.getByText('Content 3').closest('[data-current]')
        expect(currentContainer?.getAnimations().length).toBe(1)
        expect(screen.getByTestId('viewport')).toHaveAttribute('data-transitioning')
        expect(document.querySelector('[data-previous]')).toHaveTextContent('Content 2')
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
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
        name: 'right only',
        trigger1: { top: 50, left: 10 },
        trigger2: { top: 52, left: 200 },
        expected: ['right']
      },
      {
        name: 'down only',
        trigger1: { top: 10, left: 50 },
        trigger2: { top: 100, left: 52 },
        expected: ['down']
      },
      {
        name: 'within tolerance',
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
    ])('data-activation-direction: $name', async ({ trigger1, trigger2, expected }) => {
      render(ViewportDirection, { trigger1, trigger2 })

      const t1 = screen.getByTestId('trigger1')
      const t2 = screen.getByTestId('trigger2')

      t1.focus()
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      t2.focus()
      const viewport = screen.getByTestId('viewport')
      await waitFor(() => expect(viewport).toHaveAttribute('data-activation-direction'))

      const direction = viewport.getAttribute('data-activation-direction')
      if (expected.length === 0) {
        expect(direction?.trim()).toBe('')
      } else {
        expected.forEach((dir) => expect(direction).toContain(dir))
      }
    })
  })

  describe.skipIf(isJSDOM)('morphing containers', () => {
    it('marks the previous container inert and removes it after the transition', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        render(ViewportMorph)

        const trigger1 = screen.getByTestId('trigger1')
        const trigger2 = screen.getByTestId('trigger2')

        trigger1.focus()
        await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

        trigger2.focus()

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
        expect(await screen.findByText('Content 1')).toBeVisible()
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
  })
})
