import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import DrawerIndentWithoutProvider from './fixtures/drawer-indent-without-provider.svelte'
import DrawerMultipleProviderDrawers from './fixtures/drawer-multiple-provider-drawers.svelte'
import DrawerProviderVisualState from './fixtures/drawer-provider-visual-state.svelte'

describe('<Drawer.Provider />', () => {
  it('stays active until every open drawer is closed or removed', async () => {
    const { rerender } = render(DrawerMultipleProviderDrawers, {
      firstOpen: false,
      secondOpen: false,
      showSecond: true
    })
    const background = screen.getByTestId('background')

    expect(background).toHaveAttribute('data-inactive', '')

    await rerender({ firstOpen: true, secondOpen: false, showSecond: true })
    await waitFor(() => expect(background).toHaveAttribute('data-active', ''))

    await rerender({ firstOpen: false, secondOpen: true, showSecond: true })
    await waitFor(() => expect(background).toHaveAttribute('data-active', ''))

    await rerender({ firstOpen: false, secondOpen: true, showSecond: false })
    await waitFor(() => expect(background).toHaveAttribute('data-inactive', ''))
  })

  it('ignores redundant registry updates without disturbing active state', async () => {
    const user = userEvent.setup()
    render(DrawerProviderVisualState)
    const background = screen.getByTestId('background')

    await user.click(screen.getByRole('button', { name: 'Register open' }))
    await waitFor(() => expect(background).toHaveAttribute('data-active', ''))

    await user.click(screen.getByRole('button', { name: 'Register open' }))
    await user.click(screen.getByRole('button', { name: 'Remove missing' }))
    expect(background).toHaveAttribute('data-active', '')

    await user.click(screen.getByRole('button', { name: 'Register closed' }))
    await waitFor(() => expect(background).toHaveAttribute('data-inactive', ''))

    await user.click(screen.getByRole('button', { name: 'Register closed' }))
    expect(background).toHaveAttribute('data-inactive', '')
  })

  it('synchronizes visual state on Drawer.Indent and normalizes invalid values', async () => {
    const user = userEvent.setup()
    render(DrawerProviderVisualState)
    const indent = screen.getByTestId('indent')

    await user.click(screen.getByRole('button', { name: 'Set visual state' }))
    await waitFor(() =>
      expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0.5')
    )
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('120px')

    await user.click(screen.getByRole('button', { name: 'Set invalid visual state' }))
    await waitFor(() => expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0'))
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('')

    await user.click(screen.getByRole('button', { name: 'Clear visual state' }))
    await waitFor(() => expect(indent.style.getPropertyValue('--drawer-height')).toBe(''))
    expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0')
  })

  it('allows indent parts to render without a provider', () => {
    render(DrawerIndentWithoutProvider)

    expect(screen.getByTestId('indent')).toHaveAttribute('data-inactive', '')
    expect(screen.getByTestId('background')).toHaveAttribute('data-inactive', '')
  })
})
