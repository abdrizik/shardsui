import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import BasicMenu from './fixtures/basic-menu.svelte'
import KeepMountedActions from './fixtures/keep-mounted-actions.svelte'
import KeepMountedMenu from './fixtures/keep-mounted-menu.svelte'

describe('<Menu.Portal />', () => {
  it('does not leave a tabbable item after tabbing out of a keepMounted menu before close', async () => {
    const user = userEvent.setup()
    let actions: { close: () => void } | undefined
    render(KeepMountedActions, { onActions: (a: { close: () => void }) => (actions = a) })

    const trigger = screen.getByRole('button', { name: 'Toggle' })
    trigger.focus()
    await user.keyboard('[Enter]')

    const menuItem = await screen.findByTestId('item-1')
    await waitFor(() => expect(menuItem).toHaveFocus())
    expect(menuItem).toHaveAttribute('tabindex', '0')

    await user.tab()
    await waitFor(() => expect(screen.getByTestId('after')).toHaveFocus())

    actions!.close()
    await waitFor(() => expect(screen.getByTestId('menu')).not.toHaveAttribute('data-open'))

    expect(menuItem).toHaveAttribute('tabindex', '-1')
  })

  describe('prop: keepMounted', () => {
    it('when keepMounted=true, keeps the content mounted when closed', async () => {
      const user = userEvent.setup()
      render(KeepMountedMenu)

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      expect(screen.getByTestId('menu')).toBeInTheDocument()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      await user.click(trigger)
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
      expect(screen.getByTestId('menu')).toBeInTheDocument()
    })

    it('when keepMounted=false, unmounts the content when closed', async () => {
      const user = userEvent.setup()
      render(BasicMenu, { modal: false })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      expect(screen.queryByTestId('menu')).not.toBeInTheDocument()

      await user.click(trigger)
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument())
    })
  })
})
