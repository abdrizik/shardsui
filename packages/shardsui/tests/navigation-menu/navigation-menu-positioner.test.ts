import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import SideDirection from './fixtures/side-direction.svelte'

describe('<NavigationMenu.Positioner />', () => {
  describe('prop: side', () => {
    it.each([
      ['left in LTR', 'ltr', 'left'],
      ['inline-start in LTR', 'ltr', 'inline-start'],
      ['inline-end in RTL', 'rtl', 'inline-end']
    ] as const)(
      'pins the popup to the right edge when side is %s so it grows leftward',
      async (_label, direction, side) => {
        render(SideDirection, { direction, side })

        const trigger = screen.getByTestId('trigger-1')
        fireEvent.click(trigger)

        const popup = await screen.findByTestId('popup-root')
        await waitFor(() => {
          expect(popup).toHaveAttribute('data-side', side)
        })
        expect(popup).toHaveStyle({ position: 'absolute', top: '0px', right: '0px' })
      }
    )
  })
})
