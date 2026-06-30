import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BackdropDialog from './fixtures/backdrop-dialog.svelte'
import MultiLevelNestedDialog from './fixtures/multi-level-nested-dialog.svelte'

describe('<Dialog.Backdrop />', () => {
  it('has role="presentation"', () => {
    render(BackdropDialog, { open: true })
    expect(screen.getByTestId('root-backdrop')).toHaveAttribute('role', 'presentation')
  })

  describe('nested backdrops', () => {
    it('renders a backdrop at every nesting level', () => {
      render(MultiLevelNestedDialog, { level2Open: true, level3Open: true })
      expect(screen.getByTestId('level-1-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('level-2-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('level-3-backdrop')).toBeInTheDocument()
    })

    it('marks nested backdrops with data-nested so they can be hidden with CSS', () => {
      render(BackdropDialog, { open: true, includeNestedBackdrop: true, nestedOpen: true })
      expect(screen.getByTestId('root-backdrop')).not.toHaveAttribute('data-nested')
      expect(screen.getByTestId('nested-backdrop')).toHaveAttribute('data-nested')
    })

    it('renders the backdrop when not nested', () => {
      render(BackdropDialog, { open: true, includeNestedBackdrop: false })
      expect(screen.getByTestId('root-backdrop')).toBeInTheDocument()
    })
  })
})
