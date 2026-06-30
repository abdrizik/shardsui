import { Toast } from '$lib/components/toast'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import ClearableTitleToast from './fixtures/clearable-title-toast.svelte'
import SwappableTitleToast from './fixtures/swappable-title-toast.svelte'
import SwappedTitleToast from './fixtures/swapped-title-toast.svelte'
import TitleDescNoChildren from './fixtures/title-desc-no-children.svelte'
import ToastManager from './fixtures/toast-manager.svelte'

describe('<Toast.Title />', () => {
  afterEach(() => cleanup())

  it('throws a descriptive error when rendered outside <Toast.Root>', () => {
    expect(() => render(Toast.Title)).toThrow(
      'ShardsUI: this part must be rendered inside <Toast.Root>.'
    )
  })

  it('adds aria-labelledby to the root element', async () => {
    render(ToastManager)
    fireEvent.click(screen.getByTestId('add-button'))
    await waitFor(() => expect(screen.getByTestId('title')).toBeInTheDocument())

    const title = screen.getByTestId('title')
    expect(title.id).toBeTruthy()
    expect(screen.getByTestId('root').getAttribute('aria-labelledby')).toBe(title.id)
  })

  it('does not render if it has no children', async () => {
    render(TitleDescNoChildren)
    fireEvent.click(screen.getByTestId('add-no-title'))
    await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())
    expect(screen.queryByTestId('title')).toBeNull()
  })

  it('renders the title by default', async () => {
    render(TitleDescNoChildren)
    fireEvent.click(screen.getByTestId('add-with-title'))
    await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('title'))
  })

  it('clears aria-labelledby from the root when the title content is removed', async () => {
    render(ClearableTitleToast)
    fireEvent.click(screen.getByTestId('add'))
    await waitFor(() => expect(screen.getByTestId('title')).toBeInTheDocument())

    const root = screen.getByTestId('root')
    expect(root).toHaveAttribute('aria-labelledby')

    fireEvent.click(screen.getByTestId('clear'))
    await waitFor(() => expect(screen.queryByTestId('title')).toBeNull())
    expect(root).not.toHaveAttribute('aria-labelledby')
  })

  it('does not let an older title cleanup clear a newer title', async () => {
    render(SwappableTitleToast)
    fireEvent.click(screen.getByTestId('add'))
    await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())

    const root = screen.getByTestId('root')
    expect(root).toHaveAttribute('aria-labelledby', 'old-title')

    fireEvent.click(screen.getByTestId('both'))
    await waitFor(() => expect(root).toHaveAttribute('aria-labelledby', 'new-title'))

    fireEvent.click(screen.getByTestId('new'))
    await waitFor(() => expect(screen.queryByText('Old')).toBeNull())
    expect(root).toHaveAttribute('aria-labelledby', 'new-title')
  })

  it('keeps aria-labelledby on the mounted title when two titles with generated ids swap', async () => {
    render(SwappedTitleToast)
    fireEvent.click(screen.getByTestId('add'))
    await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())

    const root = screen.getByTestId('root')
    expect(root).toHaveAttribute('aria-labelledby', screen.getByTestId('title').id)

    for (const text of ['B', 'A', 'B']) {
      fireEvent.click(screen.getByTestId('swap'))
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent(text))
      expect(root).toHaveAttribute('aria-labelledby', screen.getByTestId('title').id)
    }
  })
})
