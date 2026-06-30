import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import DialogViewport from './fixtures/dialog-viewport.svelte'

describe('<Dialog.Viewport />', () => {
  it('renders only when the dialog is mounted (open)', async () => {
    const user = userEvent.setup()
    render(DialogViewport)

    expect(screen.queryByTestId('viewport')).toBeNull()

    await user.click(screen.getByText('Open'))

    expect(screen.getByTestId('viewport')).toBeInTheDocument()
    expect(screen.getByTestId('viewport')).toContainElement(screen.getByTestId('popup'))
  })

  it('stays mounted when used within a keepMounted portal', async () => {
    const { rerender } = render(DialogViewport, { open: true, keepMounted: true })

    expect(screen.getByTestId('viewport')).toBeInTheDocument()

    await rerender({ open: false, keepMounted: true })

    expect(screen.getByTestId('viewport')).toBeInTheDocument()
  })
})
