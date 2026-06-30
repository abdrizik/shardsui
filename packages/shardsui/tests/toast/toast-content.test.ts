import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import ContentToast from './fixtures/content-toast.svelte'

describe('<Toast.Content />', () => {
  afterEach(() => cleanup())

  it('marks content behind the frontmost toast with data-behind', async () => {
    render(ContentToast)

    const addButton = screen.getByRole('button', { name: 'add' })
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    await screen.findByTestId('content-toast-2')
    expect(screen.getByTestId('content-toast-2')).not.toHaveAttribute('data-behind')
    expect(screen.getByTestId('content-toast-1')).toHaveAttribute('data-behind')
  })

  it('reflects the expanded state when the viewport is hovered', async () => {
    render(ContentToast)

    fireEvent.click(screen.getByRole('button', { name: 'add' }))
    const content = await screen.findByTestId('content-toast-1')
    expect(content).not.toHaveAttribute('data-expanded')

    fireEvent.mouseEnter(screen.getByTestId('viewport'))
    await waitFor(() => expect(content).toHaveAttribute('data-expanded'))
  })
})
