import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicToast from './fixtures/basic-toast.svelte'

describe('<Toast.Close />', () => {
  afterEach(() => cleanup())

  it('closes the toast when clicked', async () => {
    render(BasicToast)
    fireEvent.click(screen.getByTestId('add-button'))
    await waitFor(() => expect(screen.getByTestId('toast-root')).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('toast-close'))
    await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
  })
})
