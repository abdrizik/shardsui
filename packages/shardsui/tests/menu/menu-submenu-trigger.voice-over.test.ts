import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SingleSubmenuMenu from './fixtures/single-submenu-menu.svelte'

// `vi.mock` is hoisted per test file, so VoiceOver's platform needs a file of its own.
vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return { ...actual, isMac: true }
})

describe('<Menu.SubmenuTrigger /> with VoiceOver', () => {
  it('omits the expanded state when the submenu is opened with ArrowRight', async () => {
    const user = userEvent.setup()
    render(SingleSubmenuMenu)

    await user.keyboard('[Tab]')
    await user.keyboard('[Enter]')

    const submenuTrigger = await screen.findByRole('menuitem', { name: 'More' })
    await waitFor(() => {
      expect(submenuTrigger).toHaveFocus()
    })
    expect(submenuTrigger).toHaveAttribute('aria-expanded', 'false')

    await user.keyboard('[ArrowRight]')

    await screen.findByTestId('submenu')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus()
    })

    expect(submenuTrigger).not.toHaveAttribute('aria-expanded')
    expect(submenuTrigger).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('omits the expanded state when the submenu is opened with Enter', async () => {
    const user = userEvent.setup()
    render(SingleSubmenuMenu)

    await user.keyboard('[Tab]')
    await user.keyboard('[Enter]')

    const submenuTrigger = await screen.findByRole('menuitem', { name: 'More' })
    await waitFor(() => {
      expect(submenuTrigger).toHaveFocus()
    })

    await user.keyboard('[Enter]')

    await screen.findByTestId('submenu')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus()
    })

    expect(submenuTrigger).not.toHaveAttribute('aria-expanded')
  })

  it('keeps the expanded state when the submenu is opened with a pointer', async () => {
    const user = userEvent.setup()
    render(SingleSubmenuMenu)

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    const submenuTrigger = await screen.findByRole('menuitem', { name: 'More' })
    await user.click(submenuTrigger)

    await screen.findByTestId('submenu')

    expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true')
  })
})
