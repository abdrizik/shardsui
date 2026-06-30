import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import ActionPropsDisabled from './fixtures/action-props-disabled.svelte'
import ActionToast from './fixtures/action-toast.svelte'

describe('<Toast.Action />', () => {
  afterEach(() => cleanup())

  it('performs an action when clicked', async () => {
    render(ActionToast)
    fireEvent.click(screen.getByTestId('add-action'))
    await waitFor(() => expect(screen.getByTestId('action')).toBeInTheDocument())
    expect(screen.getByTestId('action').id).toBe('action')
  })

  it('does not render if it has no children', async () => {
    render(ActionToast)
    fireEvent.click(screen.getByTestId('add-no-action'))
    await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())
    expect(screen.queryByTestId('action')).toBeNull()
  })

  it('disables the action when only actionProps says so', async () => {
    render(ActionPropsDisabled)
    fireEvent.click(screen.getByTestId('add'))
    await waitFor(() => expect(screen.getByTestId('action')).toBeInTheDocument())

    const action = screen.getByTestId('action') as HTMLButtonElement
    expect(action).toHaveAttribute('disabled')
    expect(action.disabled).toBe(true)
  })
})
