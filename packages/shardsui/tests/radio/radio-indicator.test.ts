import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import AnimatedRadio from './fixtures/animated-radio.svelte'
import RadioEnterAnimation from './fixtures/radio-enter-animation.svelte'
import RadioIndicatorAs from './fixtures/radio-indicator-as.svelte'
import RadioKeepMountedAnimation from './fixtures/radio-keep-mounted-animation.svelte'
import RadioNoExitAnimation from './fixtures/radio-no-exit-animation.svelte'

describe('<Radio.Indicator />', () => {
  describe('prop: as', () => {
    it.each(['span', 'div'] as const)('renders a <%s>', (as) => {
      render(RadioIndicatorAs, { as })

      expect(screen.getByTestId('indicator').tagName.toLowerCase()).toBe(as)
    })
  })

  it.skipIf(isJSDOM)('removes the indicator when there is no exit animation defined', async () => {
    const user = userEvent.setup()
    render(RadioNoExitAnimation, { value: 'a' })

    expect(screen.getByTestId('indicator-a')).not.toBe(null)

    await user.click(screen.getByText('Close'))

    await waitFor(() => {
      expect(screen.queryByTestId('indicator-a')).toBe(null)
    })
  })

  it.skipIf(isJSDOM)('removes the indicator when the animation finishes', async () => {
    const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
    globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    try {
      const user = userEvent.setup()

      let animationFinished = false
      const notifyAnimationFinished = () => {
        animationFinished = true
      }

      render(RadioKeepMountedAnimation, { value: 'a', onanimationend: notifyAnimationFinished })

      expect(screen.getByTestId('indicator-a')).not.toBe(null)

      await user.click(screen.getByText('Close'))

      await waitFor(() => {
        expect(animationFinished).toBe(true)
      })
    } finally {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    }
  })

  describe.skipIf(isJSDOM)('animations', () => {
    it('triggers enter animation via data-starting-style when mounting', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      let transitionFinished = false
      const notifyTransitionFinished = () => {
        transitionFinished = true
      }

      try {
        render(RadioEnterAnimation, { value: 'b', ontransitionend: notifyTransitionFinished })

        expect(screen.queryByTestId('indicator-a')).toBe(null)

        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => {
            fireEvent.click(screen.getByText('Select a'))
            resolve()
          })
        )

        await waitFor(() => {
          expect(transitionFinished).toBe(true)
        })

        expect(screen.getByTestId('indicator-a')).not.toBe(null)
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })

    it('applies data-ending-style before unmount', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        render(AnimatedRadio, { value: 'a' })
        expect(screen.getByTestId('indicator-a')).not.toBe(null)

        fireEvent.click(screen.getByTestId('radio-b'))

        await waitFor(() => {
          const indicatorA = screen.queryByTestId('indicator-a')
          expect(indicatorA).not.toBe(null)
          expect(indicatorA).toHaveAttribute('data-ending-style')
        })

        await waitFor(() => {
          expect(screen.queryByTestId('indicator-a')).toBe(null)
        })
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
  })
})
