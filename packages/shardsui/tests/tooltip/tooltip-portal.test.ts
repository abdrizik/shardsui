import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import TooltipKeepMounted from './fixtures/tooltip-keep-mounted.svelte'

describe('<Tooltip.Portal />', () => {
  describe('prop: keepMounted', () => {
    it('renders the closed popup as hidden instead of unmounting it', async () => {
      render(TooltipKeepMounted, { keepMounted: true })

      const popup = screen.getByTestId('popup')
      expect(popup).toBeInTheDocument()
      expect(popup.closest('[hidden]')).not.toBeNull()
    })

    it('unmounts the closed popup by default', async () => {
      render(TooltipKeepMounted)

      expect(screen.queryByTestId('popup')).toBeNull()
    })
  })
})
