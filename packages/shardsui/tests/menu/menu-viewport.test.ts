import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { isJSDOM } from '../test-utils'
import MenuWithViewportPayload from './fixtures/menu-with-viewport-payload.svelte'
import MenuWithViewport from './fixtures/menu-with-viewport.svelte'
import ViewportActivationDirection from './fixtures/viewport-activation-direction.svelte'
import ViewportMorphing from './fixtures/viewport-morphing.svelte'
import ViewportRapidTriggers from './fixtures/viewport-rapid-triggers.svelte'

describe('<Menu.Viewport />', () => {
  it('renders children in the `current` container by default', async () => {
    render(MenuWithViewport, { open: true })

    const currentContainer = screen.getByTestId('content').closest('[data-current]')
    expect(currentContainer).not.toBe(null)
    expect(currentContainer!.textContent).toBe('Content')
  })

  it('remounts the `current` container when the active trigger changes', async () => {
    const user = userEvent.setup()
    render(MenuWithViewportPayload)

    await user.click(screen.getByTestId('trigger1'))

    const firstImage = await screen.findByTestId('payload-image-1')
    const firstContainer = firstImage.closest('[data-current]')
    expect(firstContainer).not.toBe(null)

    await user.click(screen.getByTestId('trigger2'))

    await waitFor(() => {
      const secondImage = screen.getByTestId('payload-image-2')
      const secondContainer = secondImage.closest('[data-current]')
      expect(secondContainer).not.toBe(null)
      expect(secondContainer).not.toBe(firstContainer)
    })
  })

  describe.skipIf(isJSDOM)('morphing containers with multiple triggers and payloads', () => {
    beforeEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    it('creates morphing containers during transitions', async () => {
      const user = userEvent.setup()
      render(ViewportMorphing)

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      await user.click(screen.getByTestId('trigger2'))

      let previousContainer: HTMLElement | null = null
      await waitFor(() => {
        previousContainer = document.querySelector('[data-previous]')
        expect(previousContainer).not.toBe(null)
      })

      expect(previousContainer!).toHaveAttribute('inert')
      expect(previousContainer!.textContent).toBe('Content 0')
      expect(previousContainer!.style.getPropertyValue('--popup-width')).toMatch(
        /^\d+(?:\.\d+)?px$/
      )
      expect(previousContainer!.style.getPropertyValue('--popup-height')).toMatch(
        /^\d+(?:\.\d+)?px$/
      )

      const nextContainer = document.querySelector('[data-current]')
      expect(nextContainer).not.toBe(null)
      expect(nextContainer!.textContent).toBe('Content 1')

      await waitFor(() => expect(document.querySelector('[data-previous]')).toBe(null))

      expect(document.querySelector('[data-current]')).toBeVisible()
      expect(screen.getByText('Content 1')).toBeVisible()
    })

    it('does not have inline scale style after switching triggers', async () => {
      const user = userEvent.setup()
      render(ViewportRapidTriggers)

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveTextContent('Content 1'))

      await user.click(screen.getByTestId('trigger2'))
      await waitFor(() => expect(screen.getByTestId('popup')).toHaveTextContent('Content 2'))

      expect(screen.getByTestId('popup').style.scale).toBe('')
    })

    it.each([
      {
        name: 'calculates the "right down" direction',
        trigger1: { top: 10, left: 10 },
        trigger2: { top: 100, left: 200 },
        expectedDirection: ['right', 'down']
      },
      {
        name: 'calculates the "left up" direction',
        trigger1: { top: 100, left: 200 },
        trigger2: { top: 10, left: 10 },
        expectedDirection: ['left', 'up']
      },
      {
        name: 'calculates the "right" direction (horizontal only)',
        trigger1: { top: 50, left: 10 },
        trigger2: { top: 52, left: 200 },
        expectedDirection: ['right']
      },
      {
        name: 'calculates the "down" direction (vertical only)',
        trigger1: { top: 10, left: 50 },
        trigger2: { top: 100, left: 52 },
        expectedDirection: ['down']
      },
      {
        name: 'handles tolerance for small differences',
        trigger1: { top: 50, left: 50 },
        trigger2: { top: 52, left: 52 },
        expectedDirection: []
      },
      {
        name: 'calculates the "left down" direction',
        trigger1: { top: 10, left: 200 },
        trigger2: { top: 100, left: 10 },
        expectedDirection: ['left', 'down']
      },
      {
        name: 'calculates the "right up" direction',
        trigger1: { top: 100, left: 10 },
        trigger2: { top: 10, left: 200 },
        expectedDirection: ['right', 'up']
      }
    ])('$name', async ({ trigger1, trigger2, expectedDirection }) => {
      const user = userEvent.setup()
      render(ViewportActivationDirection, { trigger1, trigger2 })

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      await user.click(screen.getByTestId('trigger2'))

      const viewport = screen.getByTestId('viewport')
      await waitFor(() => expect(viewport).toHaveAttribute('data-activation-direction'))

      const direction = viewport.getAttribute('data-activation-direction')
      if (expectedDirection.length === 0) {
        expect(direction?.trim()).toBe('')
      } else {
        for (const dir of expectedDirection) {
          expect(direction).toContain(dir)
        }
      }
    })

    it('handles rapid trigger changes', async () => {
      const user = userEvent.setup()
      render(ViewportRapidTriggers)

      await user.click(screen.getByTestId('trigger1'))
      await user.click(screen.getByTestId('trigger2'))
      await user.click(screen.getByTestId('trigger3'))
      await user.click(screen.getByTestId('trigger1'))

      const content = await screen.findByText('Content 1')
      await waitFor(() => {
        expect(content.closest('[data-current]')).not.toBe(null)
      })
    })
  })
})
