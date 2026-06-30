import { render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import ConfigurableArea from './fixtures/configurable-area.svelte'

describe('<ScrollArea.Corner />', () => {
  describe('rendering', () => {
    it('renders a custom as element', async () => {
      render(ConfigurableArea, {
        corner: true,
        cornerAs: 'section',
        keepMounted: true,
        mockMetrics: true
      })
      expect((await screen.findByTestId('corner')).tagName.toLowerCase()).toBe('section')
    })
  })

  describe.skipIf(isJSDOM)('sizing', () => {
    it('applies the correct corner size when both scrollbars are present', async () => {
      render(ConfigurableArea, {
        corner: true,
        vScrollbarStyle: 'width: 10px;',
        hScrollbarStyle: 'height: 10px;'
      })

      const corner = screen.getByTestId('corner')

      await waitFor(() => {
        expect(getComputedStyle(corner).getPropertyValue('--scroll-area-corner-width')).toBe('10px')
      })
      expect(getComputedStyle(corner).getPropertyValue('--scroll-area-corner-height')).toBe('10px')
    })
  })
})
