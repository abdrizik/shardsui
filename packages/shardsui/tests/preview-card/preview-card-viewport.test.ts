import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import ElementTypes from './fixtures/element-types.svelte'
import PreviewCardViewportOutsidePositioner from './fixtures/preview-card-viewport-outside-positioner.svelte'
import PreviewCardViewportPayload from './fixtures/preview-card-viewport-payload.svelte'
import PreviewCardViewport from './fixtures/preview-card-viewport.svelte'
import ViewportDirection from './fixtures/viewport-direction.svelte'
import ViewportRapid from './fixtures/viewport-rapid.svelte'

describe('<PreviewCard.Viewport />', () => {
  it('throws a descriptive error when rendered outside <PreviewCard.Positioner>', () => {
    expect(() => render(PreviewCardViewportOutsidePositioner)).toThrow(
      'ShardsUI: this part must be rendered inside <PreviewCard.Positioner>.'
    )
  })

  it('renders a custom as element', () => {
    render(ElementTypes, { viewportAs: 'section' })
    expect(screen.getByTestId('viewport').tagName.toLowerCase()).toBe('section')
  })

  it('renders children in the `current` container by default', async () => {
    render(PreviewCardViewport, { open: true })

    let currentContainer: Element | null = null
    await waitFor(() => {
      const el = screen.getByTestId('content').closest('[data-current]')
      expect(el).not.toBe(null)
      currentContainer = el
    })

    expect(currentContainer!.textContent).toBe('Content')
  })

  it('remounts the `current` container when the active trigger changes', async () => {
    render(PreviewCardViewportPayload)

    const trigger1 = screen.getByTestId('trigger1')
    const trigger2 = screen.getByTestId('trigger2')

    trigger1.focus()

    const firstImage = await screen.findByTestId('payload-image-1')
    const firstContainer = firstImage.closest('[data-current]')
    expect(firstContainer).not.toBe(null)

    trigger2.focus()

    const secondImage = await screen.findByTestId('payload-image-2')
    const secondContainer = secondImage.closest('[data-current]')
    expect(secondContainer).not.toBe(null)
    expect(secondContainer).not.toBe(firstContainer)
  })

  describe.skipIf(isJSDOM)('positioned', () => {
    it('handles rapid trigger changes', async () => {
      render(ViewportRapid)

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')
      const trigger3 = screen.getByTestId('trigger3')

      trigger1.focus()
      await tick()
      trigger2.focus()
      await tick()
      trigger3.focus()
      await tick()
      trigger1.focus()

      await waitFor(() => expect(screen.getByText('Content 1')).toBeVisible())
    })
  })

  describe.skipIf(isJSDOM)('morphing with animations', () => {
    const injectedStyles: HTMLStyleElement[] = []

    const morphStyles = `
      [data-transitioning] [data-previous] {
        animation: preview-card-slide-out 0.2s ease-out forwards;
      }
      [data-transitioning] [data-current] {
        animation: preview-card-slide-in 0.2s ease-out forwards;
      }
      @keyframes preview-card-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-30%); opacity: 0; }
      }
      @keyframes preview-card-slide-in {
        from { transform: translateX(30%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `

    beforeEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      const style = document.createElement('style')
      style.textContent = morphStyles
      document.head.appendChild(style)
      injectedStyles.push(style)
    })

    afterEach(() => {
      injectedStyles.forEach((style) => style.remove())
      injectedStyles.length = 0
    })

    it('renders an inert previous container and cleans it up after the animation', async () => {
      render(ViewportDirection)

      screen.getByTestId('trigger1').focus()
      await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

      screen.getByTestId('trigger2').focus()
      let previousContainer: HTMLElement | null = null
      await waitFor(() => {
        previousContainer = document.querySelector('[data-previous]')
        expect(previousContainer).not.toBe(null)
      })

      expect(previousContainer!).toHaveAttribute('inert')
      expect(previousContainer!.textContent).toBe('Content 0')

      const nextContainer = document.querySelector('[data-current]')
      expect(nextContainer).not.toBe(null)
      expect(nextContainer!.textContent).toBe('Content 1')
      await waitFor(() => expect(document.querySelector('[data-previous]')).toBe(null))

      expect(document.querySelector('[data-current]')).toBeVisible()
      expect(screen.getByText('Content 1')).toBeVisible()
    })

    it.each([
      {
        name: 'right down',
        trigger1: { top: 10, left: 10 },
        trigger2: { top: 100, left: 200 },
        expectedDirection: ['right', 'down']
      },
      {
        name: 'left up',
        trigger1: { top: 100, left: 200 },
        trigger2: { top: 10, left: 10 },
        expectedDirection: ['left', 'up']
      },
      {
        name: 'right only',
        trigger1: { top: 50, left: 10 },
        trigger2: { top: 52, left: 200 }, // 2px vertical difference within tolerance
        expectedDirection: ['right']
      },
      {
        name: 'down only',
        trigger1: { top: 10, left: 50 },
        trigger2: { top: 100, left: 52 }, // 2px horizontal difference within tolerance
        expectedDirection: ['down']
      },
      {
        name: 'no direction within tolerance',
        trigger1: { top: 50, left: 50 },
        trigger2: { top: 52, left: 52 }, // Both differences within 5px tolerance
        expectedDirection: []
      },
      {
        name: 'left down',
        trigger1: { top: 10, left: 200 },
        trigger2: { top: 100, left: 10 },
        expectedDirection: ['left', 'down']
      },
      {
        name: 'right up',
        trigger1: { top: 100, left: 10 },
        trigger2: { top: 10, left: 200 },
        expectedDirection: ['right', 'up']
      }
    ])(
      'exposes data-activation-direction: $name',
      async ({ trigger1, trigger2, expectedDirection }) => {
        render(ViewportDirection, { trigger1, trigger2 })

        screen.getByTestId('trigger1').focus()
        await waitFor(() => expect(screen.getByText('Content 0')).toBeVisible())

        screen.getByTestId('trigger2').focus()

        const viewport = screen.getByTestId('viewport')
        await waitFor(() => expect(viewport).toHaveAttribute('data-activation-direction'))

        const direction = viewport.getAttribute('data-activation-direction')

        if (expectedDirection.length === 0) {
          expect(direction?.trim()).toBe('')
        } else {
          expectedDirection.forEach((dir) => {
            expect(direction).toContain(dir)
          })
        }
      }
    )

    it('leaves no inline scale style on the popup after switching triggers', async () => {
      const user = userEvent.setup()
      render(PreviewCardViewportPayload)

      const trigger1 = screen.getByTestId('trigger1')
      const trigger2 = screen.getByTestId('trigger2')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('first'))

      await user.unhover(trigger1)
      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('second'))

      expect(screen.getByTestId('popup').style.scale).toBe('')
    })
  })
})
