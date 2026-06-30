import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import TitleDescNoChildren from './fixtures/title-desc-no-children.svelte'
import ToastManager from './fixtures/toast-manager.svelte'

describe('<Toast.Description />', () => {
  afterEach(() => cleanup())

  it('adds aria-describedby to the root element', async () => {
    render(ToastManager)
    fireEvent.click(screen.getByTestId('add-title'))
    await waitFor(() => expect(screen.getByTestId('description')).toBeInTheDocument())

    const description = screen.getByTestId('description')
    expect(description.id).toBeTruthy()
    expect(screen.getByTestId('root').getAttribute('aria-describedby')).toBe(description.id)
  })

  it('does not render if it has no children', async () => {
    render(TitleDescNoChildren)
    fireEvent.click(screen.getByTestId('add-no-desc'))
    await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())
    expect(screen.queryByTestId('description')).toBeNull()
  })

  it('renders the description by default', async () => {
    render(TitleDescNoChildren)
    fireEvent.click(screen.getByTestId('add-with-title'))
    await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('description'))
  })
})
