import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import ThumbAlignment from './fixtures/thumb-alignment.svelte'

const CONTROL_SIZE = 100
const THUMB_SIZE = 10

const parityCases = (['horizontal-ltr', 'horizontal-rtl', 'vertical-ltr'] as const).flatMap(
  (axis) =>
    (['center', 'edge'] as const).flatMap((alignment) =>
      (['single', 'range'] as const).map((valueKind) => ({ axis, alignment, valueKind }))
    )
)

describe('<Slider.Indicator />', () => {
  it.skipIf(isJSDOM).each(parityCases)(
    'preserves keyboard and indicator parity for $axis $alignment $valueKind sliders',
    async ({ axis, alignment, valueKind }) => {
      const user = userEvent.setup()
      const vertical = axis === 'vertical-ltr'
      const direction = axis === 'horizontal-rtl' ? 'rtl' : 'ltr'
      const range = valueKind === 'range'
      const edge = alignment === 'edge'

      render(ThumbAlignment, {
        value: range ? [30, 70] : 30,
        orientation: vertical ? 'vertical' : 'horizontal',
        thumbAlignment: alignment,
        direction,
        controlSize: CONTROL_SIZE,
        thumbSize: THUMB_SIZE
      })

      const startSide = vertical ? 'bottom' : 'insetInlineStart'
      const sizeSide = vertical ? 'height' : 'width'
      const start = edge ? '32%' : '30%'
      const size = edge ? '36%' : '40%'

      const indicator = screen.getByTestId('indicator')
      await waitFor(() => expect(indicator.style.visibility).toBe(''))

      if (edge) {
        expect(indicator.style[startSide]).toBe(range ? 'var(--start-position)' : '0px')
        expect(indicator.style[sizeSide]).toBe(
          range ? 'var(--relative-size)' : 'var(--start-position)'
        )
        expect(indicator.style.getPropertyValue('--start-position')).toBe(start)
        expect(indicator.style.getPropertyValue('--relative-size')).toBe(range ? size : '')
      } else {
        expect(indicator.style[startSide]).toBe(range ? start : '0px')
        expect(indicator.style[sizeSide]).toBe(range ? size : start)
      }

      const input = screen.getAllByRole('slider')[0]
      let incrementKey = 'ArrowRight'
      if (vertical) incrementKey = 'ArrowUp'
      else if (direction === 'rtl') incrementKey = 'ArrowLeft'

      await user.keyboard('{Tab}')
      await user.keyboard(`{${incrementKey}}{PageUp}{PageDown}{End}`)
      expect(input).toHaveAttribute('aria-valuenow', range ? '70' : '100')

      await user.keyboard('{Home}')
      expect(input).toHaveAttribute('aria-valuenow', '0')
    }
  )
})
