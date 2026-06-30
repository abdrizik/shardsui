import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import CheckboxEnterAnimation from './fixtures/checkbox-enter-animation.svelte'
import CheckboxExitAnimation from './fixtures/checkbox-exit-animation.svelte'
import CheckboxIndicatorProps from './fixtures/checkbox-indicator-props.svelte'
import IndicatorOutsideRoot from './fixtures/indicator-outside-root.svelte'

describe('<Checkbox.Indicator />', () => {
  it('throws a descriptive error when rendered outside <Checkbox.Root>', () => {
    expect(() => render(IndicatorOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Checkbox.Root>.'
    )
  })

  it.skipIf(isJSDOM)('removes the indicator when unchecked with no exit animation', async () => {
    const { rerender } = render(CheckboxIndicatorProps, { checked: true })
    expect(screen.getByTestId('indicator')).not.toBe(null)

    await rerender({ checked: false })

    await waitFor(() => expect(screen.queryByTestId('indicator')).toBe(null))
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

      render(CheckboxExitAnimation, {
        keepMounted: true,
        onanimationend: notifyAnimationFinished
      })

      expect(screen.getByTestId('indicator')).not.toBe(null)

      await user.click(screen.getByText('Uncheck'))

      await waitFor(() => expect(animationFinished).toBe(true))
    } finally {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    }
  })

  describe.skipIf(isJSDOM)('animations', () => {
    it('triggers enter animation via data-starting-style when mounting', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        let transitionFinished = false
        const notifyTransitionFinished = () => {
          transitionFinished = true
        }

        render(CheckboxEnterAnimation, { ontransitionend: notifyTransitionFinished })

        expect(screen.queryByTestId('indicator')).toBe(null)

        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => {
            fireEvent.click(screen.getByText('Check'))
            resolve()
          })
        )

        await waitFor(() => expect(transitionFinished).toBe(true))

        expect(screen.getByTestId('indicator')).not.toBe(null)
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })

    it('applies data-ending-style before unmount', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        const user = userEvent.setup()
        render(CheckboxExitAnimation)

        expect(screen.getByTestId('indicator')).not.toBe(null)

        await user.click(screen.getByText('Uncheck'))

        await waitFor(() => {
          expect(screen.queryByTestId('indicator')).toHaveAttribute('data-ending-style')
        })

        await waitFor(() => expect(screen.queryByTestId('indicator')).toBe(null))
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
  })

  describe('render gating', () => {
    it('does not render indicator by default', () => {
      render(CheckboxIndicatorProps)
      expect(screen.queryByTestId('indicator')).toBe(null)
    })

    it('renders indicator when checked', () => {
      render(CheckboxIndicatorProps, { checked: true })
      expect(screen.getByTestId('indicator')).not.toBe(null)
    })

    it('renders the element named by `as`', () => {
      render(CheckboxIndicatorProps, { checked: true, as: 'div' })
      expect(screen.getByTestId('indicator').tagName.toLowerCase()).toBe('div')
    })

    it('spreads extra props', () => {
      render(CheckboxIndicatorProps, { checked: true, 'data-extra-prop': 'Lorem ipsum' })
      const indicator = screen.getByTestId('indicator')
      expect(indicator).toHaveAttribute('data-extra-prop', 'Lorem ipsum')
    })

    describe('prop: keepMounted', () => {
      it('keeps indicator mounted when unchecked', () => {
        render(CheckboxIndicatorProps, { keepMounted: true })
        expect(screen.getByTestId('indicator')).not.toBe(null)
      })

      it('keeps indicator mounted when checked', () => {
        render(CheckboxIndicatorProps, { checked: true, keepMounted: true })
        expect(screen.getByTestId('indicator')).not.toBe(null)
      })

      it('keeps indicator mounted when indeterminate', () => {
        render(CheckboxIndicatorProps, { indeterminate: true, keepMounted: true })
        expect(screen.getByTestId('indicator')).not.toBe(null)
      })
    })
  })
})
