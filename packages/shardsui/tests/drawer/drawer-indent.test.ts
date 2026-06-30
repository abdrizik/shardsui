import { render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import DrawerWithIndent from './fixtures/drawer-with-indent.svelte'

describe('<Drawer.Indent />', () => {
  it('sets data-active when any drawer is open', async () => {
    const { rerender } = render(DrawerWithIndent, { open: false })

    expect(screen.getByTestId('indent')).toHaveAttribute('data-inactive', '')
    expect(screen.getByTestId('indent')).not.toHaveAttribute('data-active')

    await rerender({ open: true })

    await waitFor(() => {
      expect(screen.getByTestId('indent')).toHaveAttribute('data-active', '')
    })
    expect(screen.getByTestId('indent')).not.toHaveAttribute('data-inactive')
    expect(screen.getByTestId('bg')).toHaveAttribute('data-active', '')
  })
})
