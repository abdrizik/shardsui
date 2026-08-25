import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import AnimatedFade from './fixtures/animated-fade.svelte'
import TooltipDisabled from './fixtures/tooltip-disabled.svelte'
import TooltipPopupOutsidePositioner from './fixtures/tooltip-popup-outside-positioner.svelte'

describe('<Tooltip.Popup />', () => {
  it('throws a descriptive error when rendered outside <Tooltip.Positioner>', () => {
    expect(() => render(TooltipPopupOutsidePositioner)).toThrow(
      'ShardsUI: this part must be rendered inside <Tooltip.Positioner>.'
    )
  })

  describe('popup renders children', () => {
    it('renders popup content when open=true', async () => {
      render(TooltipDisabled, { open: true, disabled: false })

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument()
      })
    })
  })

  describe.skipIf(isJSDOM)('animations', () => {
    it('inline opacity: 0 is removed before user CSS transitions run', async () => {
      const user = userEvent.setup({ delay: null })
      render(AnimatedFade)

      await user.hover(screen.getByTestId('trigger'))
      const popup = await screen.findByTestId('popup')

      await waitFor(() => {
        expect(Number(getComputedStyle(popup).opacity)).toBe(1)
      })
      const opacityAnimations = popup
        .getAnimations()
        .filter((a) => a instanceof CSSTransition && a.transitionProperty === 'opacity')
      expect(opacityAnimations.length).toBe(0)
    })
  })
})
