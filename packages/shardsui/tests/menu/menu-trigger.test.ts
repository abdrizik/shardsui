import { Menu } from '$lib/components/menu'
import { PATIENT_CLICK_THRESHOLD } from '$lib/internal/constants'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BasicMenu from './fixtures/basic-menu.svelte'
import Conformance from './fixtures/conformance.svelte'
import MenuAttachedTriggersPayload from './fixtures/menu-attached-triggers-payload.svelte'
import MenuCloseVeto from './fixtures/menu-close-veto.svelte'
import MenuTriggerInPopover from './fixtures/menu-trigger-in-popover.svelte'
import MenuWithMultipleTriggers from './fixtures/menu-with-multiple-triggers.svelte'
import MenuWithOpenOnHoverTrigger from './fixtures/menu-with-open-on-hover-trigger.svelte'
import MenuWithSpanTrigger from './fixtures/menu-with-span-trigger.svelte'
import TriggerWithoutRoot from './fixtures/trigger-without-root.svelte'

describe('<Menu.Trigger />', () => {
  it('throws when rendered without <Menu.Root> or a handle', () => {
    expect(() => render(TriggerWithoutRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Menu.Root>.'
    )
  })

  describe('prop: disabled', () => {
    it('renders a disabled button', () => {
      render(BasicMenu, { triggerDisabled: true })
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveProperty('disabled', true)
    })

    it('does not open the menu when clicked', async () => {
      const user = userEvent.setup()
      render(BasicMenu, { triggerDisabled: true })
      await user.click(screen.getByRole('button', { name: 'Toggle' }))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('toggles the menu state when clicked', async () => {
    const user = userEvent.setup()
    render(BasicMenu)
    const trigger = screen.getByRole('button', { name: 'Toggle' })

    await user.click(trigger)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  describe('accessibility attributes', () => {
    it('has the aria-haspopup attribute', () => {
      render(BasicMenu)
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute('aria-haspopup')
    })

    it('has the aria-expanded=false attribute when closed', () => {
      render(BasicMenu)
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    })

    it('has aria-expanded=true when the menu is opened', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      expect(screen.getByRole('button', { name: 'Toggle' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    })

    it('has the aria-controls attribute on the trigger', () => {
      render(Conformance, { open: true })

      expect(screen.getByTestId('trigger')).toHaveAttribute(
        'aria-controls',
        screen.getByTestId('popup').id
      )
    })

    it('allows a custom id prop', () => {
      render(Conformance, { open: true, popupId: 'TestId' })

      expect(screen.getByTestId('popup')).toHaveAttribute('id', 'TestId')
      expect(screen.getByTestId('trigger')).toHaveAttribute('aria-controls', 'TestId')
    })
  })

  describe('style hooks', () => {
    it('has the data-popup-open and data-pressed attributes when open', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      const trigger = screen.getByRole('button', { name: 'Toggle' })
      await user.click(trigger)

      expect(trigger).toHaveAttribute('data-popup-open')
      expect(trigger).toHaveAttribute('data-pressed')
    })

    it('keeps the data-popup-open attribute and handle.isOpen when a controlled close is vetoed', async () => {
      const user = userEvent.setup()
      const handle = new Menu.Handle()
      render(MenuCloseVeto, { handle })

      const trigger = screen.getByRole('button', { name: 'Actions' })
      await user.click(trigger)

      await screen.findByRole('menu')
      expect(trigger).toHaveAttribute('data-popup-open')
      expect(handle.isOpen).toBe(true)

      await user.click(screen.getByRole('button', { name: 'Outside' }))

      expect(screen.getByRole('menu')).toHaveAttribute('data-open')
      expect(trigger).toHaveAttribute('data-popup-open')
      expect(handle.isOpen).toBe(true)
    })
  })

  describe('keyboard navigation', () => {
    for (const key of ['ArrowUp', 'ArrowDown']) {
      it(`opens the menu when pressing "${key}" on a native button`, async () => {
        const user = userEvent.setup()
        render(BasicMenu)
        screen.getByRole('button', { name: 'Toggle' }).focus()
        await user.keyboard(`[${key}]`)

        await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
      })
    }

    for (const key of ['ArrowUp', 'ArrowDown', 'Enter', 'Space']) {
      it(`opens the menu when pressing "${key}" on a non-native button`, async () => {
        const user = userEvent.setup()
        render(MenuWithSpanTrigger)

        screen.getByRole('button', { name: 'Open' }).focus()
        await user.keyboard(`[${key}]`)

        await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
      })
    }

    it('focuses the first item when the down arrow key opens the menu', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      screen.getByRole('button', { name: 'Toggle' }).focus()
      await user.keyboard('[ArrowDown]')

      await waitFor(
        () => expect(screen.getByTestId('item-1')).toHaveAttribute('data-highlighted', ''),
        { timeout: 3000 }
      )
    })

    it('focuses the last item when the up arrow key opens the menu', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      screen.getByRole('button', { name: 'Toggle' }).focus()
      await user.keyboard('[ArrowUp]')

      await waitFor(
        () => expect(screen.getByTestId('item-5')).toHaveAttribute('data-highlighted', ''),
        { timeout: 3000 }
      )
    })
  })

  describe('multiple triggers within Root', () => {
    it('opens the menu with any trigger', async () => {
      const user = userEvent.setup()
      render(MenuWithMultipleTriggers)

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      await user.click(screen.getByTestId('item-close'))
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Trigger 2' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      await user.click(screen.getByTestId('item-close'))
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Trigger 3' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  describe('preventShardsUIHandler', () => {
    it('prevents opening the menu with a mouse when preventShardsUIHandler is called in onmousedown', async () => {
      const user = userEvent.setup()
      render(BasicMenu, {
        triggerOnMouseDown: (event) => {
          event.preventShardsUIHandler()
        }
      })

      await user.click(screen.getByRole('button', { name: 'Toggle' }))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('prevents opening the menu with the keyboard when preventShardsUIHandler is called in onclick', async () => {
      const user = userEvent.setup()
      render(BasicMenu, {
        triggerOnClick: (event) => {
          event.preventShardsUIHandler()
        }
      })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      trigger.focus()
      await user.keyboard('{Enter}')

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('prop: openOnHover', () => {
    it('opens the menu when the trigger is hovered', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0 })

      fireEvent.mouseEnter(screen.getByRole('button', { name: 'Toggle' }))

      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument(), { timeout: 2000 })
    })

    it('closes the menu when the trigger is no longer hovered', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0, modal: false })
      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(
        () => {
          expect(screen.queryByRole('menu')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )

      fireEvent.mouseLeave(trigger)

      await waitFor(
        () => {
          expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })
  })

  describe('impatient clicks with openOnHover=true', () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
      })
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not close the menu if the user clicks too quickly', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0, modal: false })
      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.mouseMove(trigger)
      await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD - 1)
      fireEvent.click(trigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(trigger).toHaveAttribute('data-popup-open')
    })

    it('closes the menu if the user clicks patiently', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0, modal: false })
      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.mouseEnter(trigger)
      await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD)
      fireEvent.click(trigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(trigger).not.toHaveAttribute('data-popup-open')
    })

    it('sticks if the user clicks impatiently', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0, modal: false })
      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.mouseEnter(trigger)
      await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD - 1)
      fireEvent.click(trigger)
      fireEvent.mouseLeave(trigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(trigger).toHaveAttribute('data-popup-open')

      await vi.advanceTimersByTimeAsync(1)
      await vi.advanceTimersByTimeAsync(0)

      expect(trigger).toHaveAttribute('data-popup-open')
    })

    it('does not stick if the user clicks patiently', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0, modal: false })
      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.mouseEnter(trigger)
      await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD)
      fireEvent.click(trigger)
      fireEvent.mouseLeave(trigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(trigger).not.toHaveAttribute('data-popup-open')
    })

    it('sticks when clicked before the hover delay completes', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 300, modal: false })
      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      await vi.advanceTimersByTimeAsync(100)

      fireEvent.click(trigger)
      await vi.advanceTimersByTimeAsync(0)
      expect(trigger).toHaveAttribute('data-popup-open')

      fireEvent.mouseLeave(trigger)
      await vi.advanceTimersByTimeAsync(0)
      expect(trigger).toHaveAttribute('data-popup-open')
    })

    it('keeps the menu open when re-hovered and clicked within the patient threshold', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 100, modal: false })
      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      await vi.advanceTimersByTimeAsync(100)
      await vi.advanceTimersByTimeAsync(0)
      expect(screen.queryByRole('menu')).not.toBe(null)

      await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD)

      fireEvent.mouseLeave(trigger)
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      fireEvent.click(trigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(screen.queryByRole('menu')).not.toBe(null)
    })
  })

  describe('attached multiple triggers in one Root', () => {
    it('sets the payload associated with the trigger', async () => {
      const user = userEvent.setup()
      render(MenuAttachedTriggersPayload)

      await user.click(screen.getByTestId('trigger1'))
      await waitFor(() => expect(screen.getByTestId('payload')).toHaveTextContent('first'))

      await user.keyboard('{Escape}')
      await user.click(screen.getByTestId('trigger2'))
      await waitFor(() => expect(screen.getByTestId('payload')).toHaveTextContent('second'))
    })
  })

  it('does not have a role attribute inside a Popover', () => {
    render(MenuTriggerInPopover)

    expect(screen.getByTestId('menu-trigger')).not.toHaveAttribute('role')
  })

  it('has a role attribute inside a Popover when not a native button', () => {
    render(MenuTriggerInPopover, { as: 'span' })

    expect(screen.getByTestId('menu-trigger')).toHaveAttribute('role', 'button')
  })
})
