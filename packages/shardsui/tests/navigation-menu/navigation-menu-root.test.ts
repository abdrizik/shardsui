import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ControlledNavigationMenu from './fixtures/controlled-navigation-menu.svelte'
import DecliningNavigationMenu from './fixtures/declining-navigation-menu.svelte'
import DeeplyNestedCloseOnClickNavigationMenu from './fixtures/deeply-nested-close-on-click-navigation-menu.svelte'
import FalsyValue from './fixtures/falsy-value.svelte'
import InlineNestedNavigationMenu from './fixtures/inline-nested-navigation-menu.svelte'
import InlineNested from './fixtures/inline-nested.svelte'
import NavigationMenuWithNestedDialog from './fixtures/navigation-menu-with-nested-dialog.svelte'
import NavigationMenuWithNestedPopover from './fixtures/navigation-menu-with-nested-popover.svelte'
import NavigationMenuWithOutsideButton from './fixtures/navigation-menu-with-outside-button.svelte'
import NavigationMenu from './fixtures/navigation-menu.svelte'
import NestedCloseOnClick from './fixtures/nested-close-on-click.svelte'
import NestedPortal from './fixtures/nested-portal.svelte'
import NoViewport from './fixtures/no-viewport.svelte'
import OrientationAttributes from './fixtures/orientation-attributes.svelte'
import TabbableContentNavigationMenu from './fixtures/tabbable-content-navigation-menu.svelte'
import {
  OPEN_DELAY,
  PATIENT_CLICK_THRESHOLD,
  falsyValueCases,
  hoverOpen,
  mockBoundingClientRect
} from './helpers'

describe('<NavigationMenu.Root />', () => {
  it('does not apply aria-orientation to the top-level list or root element', () => {
    render(OrientationAttributes)
    expect(screen.getByTestId('top-level-root')).not.toHaveAttribute('aria-orientation')
    expect(screen.getByTestId('top-level-list')).not.toHaveAttribute('aria-orientation')
  })

  it('does not apply aria-orientation to nested lists or root elements', () => {
    render(OrientationAttributes)
    expect(screen.getByTestId('nested-root')).not.toHaveAttribute('aria-orientation')
    expect(screen.getByTestId('nested-list')).not.toHaveAttribute('aria-orientation')
  })

  describe('interactions', () => {
    it('opens on hover with mouse input', async () => {
      render(NavigationMenu)
      const trigger = screen.getByTestId('trigger-1')

      hoverOpen(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('opens on click with mouse input', async () => {
      const user = userEvent.setup()
      render(NavigationMenu)
      const trigger = screen.getByTestId('trigger-1')

      await user.click(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('does not open on hover with touch input', async () => {
      render(NavigationMenu)
      const trigger = screen.getByTestId('trigger-1')

      fireEvent.pointerEnter(trigger, { pointerType: 'touch' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(screen.queryByTestId('popup-1')).toBe(null)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens on click with touch input', async () => {
      render(NavigationMenu)
      const trigger = screen.getByTestId('trigger-1')

      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.pointerUp(trigger, { pointerType: 'touch' })
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it.skipIf(isJSDOM)('restores hover open after a touch click closes outside', async () => {
      const user = userEvent.setup()
      const { container } = render(NavigationMenu)
      const outside = document.createElement('button')
      outside.setAttribute('data-testid', 'outside')
      container.appendChild(outside)

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      fireEvent.pointerEnter(trigger1, { pointerType: 'touch' })
      fireEvent.pointerDown(trigger1, { pointerType: 'touch' })
      fireEvent.pointerUp(trigger1, { pointerType: 'touch' })
      fireEvent.click(trigger1)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      await user.click(outside)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBe(null)
      })

      await user.hover(trigger2)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-2')).not.toBe(null)
      })
    })

    it.skipIf(isJSDOM)(
      'restores hover open after touching a nested submenu trigger and closing outside',
      async () => {
        const user = userEvent.setup()
        const { container } = render(InlineNested)
        const outside = document.createElement('button')
        outside.setAttribute('data-testid', 'outside')
        container.appendChild(outside)

        const trigger = screen.getByTestId('trigger-1')

        fireEvent.pointerEnter(trigger, { pointerType: 'touch' })
        fireEvent.pointerDown(trigger, { pointerType: 'touch' })
        fireEvent.pointerUp(trigger, { pointerType: 'touch' })
        fireEvent.click(trigger)

        const nestedTrigger2 = await screen.findByTestId('nested-trigger-2')
        fireEvent.pointerEnter(nestedTrigger2, { pointerType: 'touch' })
        fireEvent.pointerDown(nestedTrigger2, { pointerType: 'touch' })
        fireEvent.pointerUp(nestedTrigger2, { pointerType: 'touch' })
        fireEvent.click(nestedTrigger2)

        await waitFor(() => {
          expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
        })

        await user.click(outside)
        await waitFor(() => {
          expect(screen.queryByTestId('popup-1')).toBe(null)
        })

        await user.hover(trigger)
        await waitFor(() => {
          expect(screen.queryByTestId('popup-1')).not.toBe(null)
        })
      }
    )

    it('restores hover open after a quick click then trigger switch', async () => {
      const user = userEvent.setup()
      render(NavigationMenu)
      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      await user.hover(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      await user.click(trigger1)

      await user.hover(trigger2)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-2')).not.toBe(null)
      })

      await user.unhover(trigger2)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-2')).toBe(null)
      })

      await user.hover(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
    })

    it('closes after pointerdown on a link in a hover-open popup when pointer leaves', async () => {
      const user = userEvent.setup()
      render(NavigationMenu)
      const trigger1 = screen.getByTestId('trigger-1')

      await user.hover(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const link1 = within(popup1).getByText('Link 1')

      await user.hover(link1)
      fireEvent.pointerDown(link1, { pointerType: 'mouse' })
      await user.unhover(link1)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBe(null)
      })
    })

    it('does not close menu when clicking a different trigger with mouse', async () => {
      render(NavigationMenu)

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      fireEvent.click(trigger1)
      await waitFor(() => {
        expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      })

      fireEvent.click(trigger2)
      await waitFor(() => {
        expect(trigger1).toHaveAttribute('aria-expanded', 'false')
        expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('does not close menu when clicking a different trigger on touch', async () => {
      render(NavigationMenu)

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      fireEvent.click(trigger1)
      await waitFor(() => {
        expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      })

      fireEvent.pointerDown(trigger2, { pointerType: 'touch' })
      fireEvent.pointerUp(trigger2, { pointerType: 'touch' })
      fireEvent.click(trigger2)
      await waitFor(() => {
        expect(trigger1).toHaveAttribute('aria-expanded', 'false')
        expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('returns focus to trigger when closing menu', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithOutsideButton)
      const trigger = screen.getByTestId('trigger-1')

      await user.click(trigger)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveFocus()

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBe(null)
      })
      expect(trigger).toHaveFocus()
    })

    it('respects focus outside when clicking menu', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithOutsideButton)
      const trigger = screen.getByTestId('trigger-1')
      const last = screen.getByTestId('last')

      await user.click(trigger)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveFocus()

      await user.click(last)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBe(null)
      })
      expect(last).toHaveFocus()
    })

    it('does not restore focus to the trigger when closed via hover', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        render(NavigationMenu)
        const trigger = screen.getByTestId('trigger-1')

        hoverOpen(trigger)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)

        expect(screen.queryByTestId('popup-1')).not.toBe(null)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')

        const popup = screen.getByTestId('popup-1')
        fireEvent.mouseLeave(trigger)
        fireEvent.mouseLeave(popup)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)

        await waitFor(() => {
          expect(screen.queryByTestId('popup-1')).toBe(null)
        })
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).not.toHaveFocus()
      } finally {
        vi.useRealTimers()
      }
    })

    it('does not restore focus to the trigger when focus moves outside', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithOutsideButton)
      const trigger = screen.getByTestId('trigger-1')
      const last = screen.getByTestId('last')

      trigger.focus()

      await user.click(trigger)
      await user.tab()
      await user.tab()
      await user.tab()
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBe(null)
      })
      expect(last).toHaveFocus()
      expect(trigger).not.toHaveFocus()
    })
  })

  describe('patient click threshold', () => {
    it('closes if hovered then clicked after the patient threshold', async () => {
      vi.useFakeTimers()
      try {
        render(NavigationMenuWithOutsideButton)
        const trigger = screen.getByTestId('trigger-1')

        fireEvent.click(trigger)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)
        expect(screen.queryByTestId('popup-1')).not.toBeNull()

        await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD)
        fireEvent.click(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.queryByTestId('popup-1')).toBeNull()
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('prop: value', () => {
    it('opens the matching item when value is initially set', async () => {
      render(ControlledNavigationMenu, { value: 'item-1' })

      await waitFor(() => {
        expect(screen.getByTestId('trigger-1')).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should be controlled by value prop', async () => {
      const { rerender } = render(NavigationMenu, { value: 'item-1' })

      const trigger1 = screen.getByTestId('trigger-1')
      await waitFor(() => {
        expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      })

      await rerender({ value: 'item-2' })

      const trigger2 = screen.getByTestId('trigger-2')
      await waitFor(() => {
        expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      })
      expect(screen.getByTestId('trigger-1')).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('prop: onValueChange', () => {
    it('should call onValueChange when value changes', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(ControlledNavigationMenu, { onValueChange })

      await user.click(screen.getByTestId('trigger-1'))
      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalled()
        expect(onValueChange.mock.lastCall?.[0]).toBe('item-1')
      })

      await user.click(screen.getByTestId('trigger-2'))
      await waitFor(() => {
        expect(onValueChange.mock.lastCall?.[0]).toBe('item-2')
      })
    })

    it('does not open when the value change is declined', async () => {
      const onValueChange = vi.fn()
      render(DecliningNavigationMenu, { onValueChange })

      const trigger = screen.getByTestId('trigger-1')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(onValueChange.mock.calls.length).toBe(1)
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('popup-1')).toBeNull()
    })

    it.each([
      ['horizontal', 'right', 'left'],
      ['vertical', 'down', 'up']
    ] as const)(
      'reports %s activation direction when switching in either direction',
      async (orientation, forwardDirection, backwardDirection) => {
        render(NavigationMenu, { orientation })

        const trigger1 = screen.getByTestId('trigger-1')
        const trigger2 = screen.getByTestId('trigger-2')

        if (orientation === 'horizontal') {
          mockBoundingClientRect(trigger1, { x: 0, y: 0, width: 80, height: 32 })
          mockBoundingClientRect(trigger2, { x: 120, y: 0, width: 80, height: 32 })
        } else {
          mockBoundingClientRect(trigger1, { x: 0, y: 0, width: 80, height: 32 })
          mockBoundingClientRect(trigger2, { x: 0, y: 80, width: 80, height: 32 })
        }

        fireEvent.click(trigger1)
        await waitFor(() => {
          expect(screen.queryByTestId('popup-1')).not.toBeNull()
        })

        fireEvent.click(trigger2)
        await waitFor(() => {
          expect(screen.getByTestId('popup-2')).toHaveAttribute(
            'data-activation-direction',
            forwardDirection
          )
        })

        fireEvent.click(trigger1)
        await waitFor(() => {
          expect(screen.getByTestId('popup-1')).toHaveAttribute(
            'data-activation-direction',
            backwardDirection
          )
        })
      }
    )

    it('does not emit a duplicate onValueChange when switching items via keyboard', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(NavigationMenu, { onValueChange })
      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      await user.click(trigger1)
      await waitFor(() => {
        expect(onValueChange.mock.calls.length).toBe(1)
        expect(onValueChange.mock.lastCall?.[0]).toBe('item-1')
        expect(screen.queryByTestId('popup-1')).not.toBeNull()
      })

      trigger1.focus()
      fireEvent.keyDown(trigger1, { key: 'ArrowRight', code: 'ArrowRight' })
      await waitFor(() => {
        expect(trigger2).toHaveFocus()
        expect(onValueChange.mock.calls.filter((call) => call[0] === 'item-2')).toHaveLength(0)
      })

      fireEvent.keyDown(trigger2, { key: 'ArrowDown', code: 'ArrowDown' })
      await waitFor(() => {
        expect(onValueChange.mock.calls.filter((call) => call[0] === 'item-2')).toHaveLength(1)
        expect(trigger2).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByTestId('popup-2')).not.toBeNull()
      })
    }, 10_000)

    it.each(falsyValueCases)(
      'treats a falsy item value (%s) as a valid open value',
      async (_label, itemValue) => {
        const onValueChange = vi.fn()
        const user = userEvent.setup()
        render(FalsyValue, { itemValue, onValueChange })

        const trigger = screen.getByTestId('trigger-0')
        await user.click(trigger)

        await waitFor(() => {
          expect(onValueChange.mock.calls.length).toBe(1)
        })
        expect(onValueChange.mock.lastCall?.[0]).toBe(itemValue)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByTestId('popup-0')).not.toBe(null)
      }
    )
  })

  describe('prop: delay', () => {
    it('respects custom delay value', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        const customDelay = 100
        render(NavigationMenu, { delay: customDelay })
        const trigger = screen.getByTestId('trigger-1')

        hoverOpen(trigger)
        await vi.advanceTimersByTimeAsync(customDelay - 25)

        expect(screen.queryByTestId('popup-1')).toBe(null)

        await vi.advanceTimersByTimeAsync(50)

        expect(screen.queryByTestId('popup-1')).not.toBe(null)
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('prop: closeDelay', () => {
    it('respects custom closeDelay value', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        const customCloseDelay = 100
        render(NavigationMenu, { closeDelay: customCloseDelay })
        const trigger = screen.getByTestId('trigger-1')

        hoverOpen(trigger)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)
        expect(screen.queryByTestId('popup-1')).not.toBe(null)

        fireEvent.mouseLeave(trigger)
        await vi.advanceTimersByTimeAsync(customCloseDelay - 25)
        expect(screen.queryByTestId('popup-1')).not.toBe(null)

        await vi.advanceTimersByTimeAsync(50)
        expect(screen.queryByTestId('popup-1')).toBe(null)
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('tabbing', () => {
    it('moves focus through the menu correctly', async () => {
      const user = userEvent.setup()
      render(NavigationMenu)
      const trigger1 = screen.getByTestId('trigger-1')

      trigger1.focus()
      fireEvent.click(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger1).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 1')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 2')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('trigger-2')).toHaveFocus()

      fireEvent.click(screen.getByTestId('trigger-2'))
      await waitFor(() => {
        expect(screen.queryByTestId('popup-2')).not.toBe(null)
      })

      await user.tab()
      expect(screen.getByText('Link 3')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 4')).toHaveFocus()

      await user.tab({ shift: true })
      await user.tab({ shift: true })
      await user.tab({ shift: true })

      expect(trigger1).toHaveFocus()
    })

    it('closes after tabbing out of arbitrary tabbable content', async () => {
      const user = userEvent.setup()
      render(TabbableContentNavigationMenu)

      const trigger = screen.getByText('Trigger')
      trigger.focus()
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.queryByTestId('popup')).not.toBeNull()
      })

      await user.tab()
      expect(screen.getByText('Action')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('After menu')).toHaveFocus()
      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBeNull()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes the menu when tabbing forward out', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithOutsideButton)
      const trigger = screen.getByTestId('trigger-1')

      trigger.focus()
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveFocus()

      await user.tab()
      await user.tab()
      await user.tab()
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBe(null)
      })
    })

    it('returns focus to the trigger when no viewport focus guard is rendered', async () => {
      render(NoViewport)

      const trigger = screen.getByText('Trigger')
      trigger.focus()
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
      })

      const guards = trigger.parentElement?.querySelectorAll<HTMLElement>(
        '[data-shards-ui-focus-guard]'
      )
      guards?.[1]?.focus()

      expect(trigger).toHaveFocus()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('returns to the last submenu item when shift+tabbing after tabbing out of it', async () => {
      const user = userEvent.setup()
      render(NavigationMenu)
      const trigger = screen.getByTestId('trigger-1')

      trigger.focus()
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 1')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 2')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('trigger-2')).toHaveFocus()

      await user.tab({ shift: true })
      expect(screen.getByText('Link 2')).toHaveFocus()
    })

    it('closes the menu when tabbing back out', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithOutsideButton)
      const trigger = screen.getByTestId('trigger-1')

      trigger.focus()
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Link 1')).toHaveFocus()

      await user.tab({ shift: true })
      await user.tab({ shift: true })

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBe(null)
      })
    })
  })

  describe('nested popups', () => {
    it('keeps a hover-open menu open when pointerdown happens on a nested dialog trigger', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithNestedDialog)
      const trigger = screen.getByTestId('trigger-1')

      hoverOpen(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
      })

      const dialogTrigger = screen.getByTestId('dialog-trigger')
      const popup = dialogTrigger.closest('nav[data-open]') as HTMLElement

      fireEvent.pointerDown(dialogTrigger, { pointerType: 'mouse' })
      fireEvent.mouseLeave(popup)

      await user.click(dialogTrigger)

      expect(await screen.findByTestId('dialog-popup')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps the menu open when interacting with a nested dialog', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithNestedDialog)
      const trigger = screen.getByTestId('trigger-1')

      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const dialogTrigger = screen.getByTestId('dialog-trigger')
      await user.click(dialogTrigger)

      expect(await screen.findByTestId('dialog-popup')).toBeInTheDocument()

      await user.click(screen.getByTestId('dialog-button'))

      await waitFor(() => {
        expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps the menu open when interacting with a nested popover', async () => {
      const user = userEvent.setup()
      render(NavigationMenuWithNestedPopover)
      const trigger = screen.getByTestId('trigger-1')

      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      const popoverTrigger = screen.getByTestId('popover-trigger')
      await user.click(popoverTrigger)

      expect(await screen.findByTestId('popover-popup')).toBeInTheDocument()

      await user.click(screen.getByTestId('popover-button'))

      await waitFor(() => {
        expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('nested menus', () => {
    it('opens nested menu on hover and stays open when hovering over nested popup', async () => {
      render(NestedPortal)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')

      hoverOpen(nestedTrigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      })
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')

      const nestedPopup1 = screen.getByTestId('nested-popup-1')
      hoverOpen(nestedPopup1)

      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      })
      expect(screen.queryByTestId('popup-1')).not.toBe(null)
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
    })

    it('handles inline nested menu without positioner/popup correctly', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')

      hoverOpen(nestedTrigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      })
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')

      const nestedPopup1 = screen.getByTestId('nested-popup-1')
      hoverOpen(nestedPopup1)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      })
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')

      const nestedTrigger2 = within(popup1).getByTestId('nested-trigger-2')
      hoverOpen(nestedTrigger2)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
      })
      expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'false')
    })

    it('keeps parent menu open when hovering inline nested triggers without an initial nested value', async () => {
      render(InlineNested, { initialNestedValue: null })
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'false')

      hoverOpen(nestedTrigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      })
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')

      const nestedTrigger2 = within(popup1).getByTestId('nested-trigger-2')
      hoverOpen(nestedTrigger2)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
      })
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes the parent menu after a nested submenu closes on delayed hover-out', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        const closeDelay = 200
        render(NestedPortal, { closeDelay })
        const trigger1 = screen.getByTestId('trigger-1')

        hoverOpen(trigger1)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)

        const popup1 = screen.getByTestId('popup-1')
        const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
        const topLevelPositioner = screen.getByTestId('top-level-positioner')

        hoverOpen(nestedTrigger1)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)

        const nestedPositioner = screen.getByTestId('nested-positioner')
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)

        fireEvent.mouseLeave(nestedTrigger1)
        fireEvent.mouseLeave(nestedPositioner)
        fireEvent.mouseLeave(topLevelPositioner)
        await vi.advanceTimersByTimeAsync(closeDelay)

        await waitFor(() => {
          expect(screen.queryByTestId('nested-popup-1')).toBe(null)
        })
        expect(screen.queryByTestId('popup-1')).toBe(null)
        expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      } finally {
        vi.useRealTimers()
      }
    })

    it('closes the parent menu when a nested link with closeOnClick is clicked', async () => {
      const user = userEvent.setup()
      render(NestedCloseOnClick)
      const trigger1 = screen.getByTestId('trigger-1')

      await user.click(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')

      hoverOpen(nestedTrigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      })

      await user.click(screen.getByTestId('nested-link-1'))

      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).toBe(null)
      })
      expect(screen.queryByTestId('popup-1')).toBe(null)
      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
    })

    it('calls onValueChange on the parent root when nested closeOnClick link is clicked', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(NestedCloseOnClick, { onValueChange })
      const trigger1 = screen.getByTestId('trigger-1')

      await user.click(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')

      hoverOpen(nestedTrigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      })

      await user.click(screen.getByTestId('nested-link-1'))

      await waitFor(() => {
        expect(onValueChange.mock.lastCall?.[0]).toBe(null)
      })
    })

    it('closes all levels when a deeply nested link with closeOnClick is clicked', async () => {
      const user = userEvent.setup()
      render(DeeplyNestedCloseOnClickNavigationMenu)
      const trigger1 = screen.getByTestId('trigger-1')

      await user.click(trigger1)

      await waitFor(() => {
        expect(screen.queryByTestId('content-1')).not.toBeNull()
      })

      expect(screen.queryByTestId('level2-content-1')).not.toBeNull()
      expect(screen.queryByTestId('level3-content-1')).not.toBeNull()

      const level3Link = screen.getByTestId('level3-link-1')
      await user.click(level3Link)

      await waitFor(() => {
        expect(screen.queryByTestId('level3-content-1')).toBeNull()
      })
      expect(screen.queryByTestId('level2-content-1')).toBeNull()
      expect(screen.queryByTestId('content-1')).toBeNull()
      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
    })

    it('allows arrow key navigation to submenu triggers', async () => {
      const user = userEvent.setup()
      render(InlineNestedNavigationMenu)
      const trigger1 = screen.getByTestId('trigger-1')

      fireEvent.click(trigger1)
      await waitFor(() => {
        expect(screen.getByTestId('popup-1')).toBeInTheDocument()
      })

      const popup1 = screen.getByTestId('popup-1')
      const link1 = screen.getByText('Link 1')
      link1.focus()

      await user.keyboard('{ArrowDown}')
      expect(within(popup1).getByTestId('nested-trigger-1')).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(within(popup1).getByTestId('nested-trigger-2')).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(within(popup1).getByTestId('nested-trigger-1')).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(link1).toHaveFocus()
    })
  })
})

describe('initial open', () => {
  it('suppresses the positioner transition for the first frame while initially open', async () => {
    vi.useFakeTimers()
    try {
      render(ControlledNavigationMenu, { value: 'item-1' })
      await Promise.resolve()
      await Promise.resolve()

      const positioner = screen.getByTestId('nav-positioner')
      expect(positioner).toHaveAttribute('data-instant')

      await vi.advanceTimersByTimeAsync(0)
      expect(positioner).not.toHaveAttribute('data-instant')
    } finally {
      vi.useRealTimers()
    }
  })
})
