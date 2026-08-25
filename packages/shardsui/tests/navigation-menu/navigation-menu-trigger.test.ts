import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ActiveItemDropsTrigger from './fixtures/active-item-drops-trigger.svelte'
import CustomListNavigationMenu from './fixtures/custom-list-navigation-menu.svelte'
import DisabledTrigger from './fixtures/disabled-trigger.svelte'
import HorizontalListNavigationMenu from './fixtures/horizontal-list-navigation-menu.svelte'
import NavigationMenuWithTopLevelLink from './fixtures/navigation-menu-with-top-level-link.svelte'
import NavigationMenu from './fixtures/navigation-menu.svelte'
import PositionerHeight from './fixtures/positioner-height.svelte'
import PositionerWidth from './fixtures/positioner-width.svelte'
import RapidHoverSizing from './fixtures/rapid-hover-sizing.svelte'
import RtlVerticalNavigationMenu from './fixtures/rtl-vertical-navigation-menu.svelte'
import { OPEN_DELAY, defineOffsetSize, hoverOpen } from './helpers'

describe('<NavigationMenu.Trigger />', () => {
  it('opens a vertical menu with the mirrored arrow key in RTL mode', async () => {
    const user = userEvent.setup()
    render(RtlVerticalNavigationMenu)

    const trigger = screen.getByRole('button', { name: 'Overview' })
    trigger.focus()

    await user.keyboard('{ArrowLeft}')

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Quick Start' })).toBeVisible()
    })
  })

  describe('prop: disabled', () => {
    it('does not open on hover when the trigger is disabled', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        const onValueChange = vi.fn()
        render(DisabledTrigger, { onValueChange })
        const trigger = screen.getByTestId('trigger-1')

        hoverOpen(trigger)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByTestId('popup-1')).toBe(null)
        expect(onValueChange).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })
    it('does not open on click when the trigger is disabled', async () => {
      const onValueChange = vi.fn()
      render(DisabledTrigger, { onValueChange })
      const trigger = screen.getByTestId('trigger-1')

      fireEvent.click(trigger)
      await Promise.resolve()

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('popup-1')).toBe(null)
      expect(onValueChange).not.toHaveBeenCalled()
    })
    it('does not open on touch when the trigger is disabled', async () => {
      const onValueChange = vi.fn()
      render(DisabledTrigger, { onValueChange })
      const trigger = screen.getByTestId('trigger-1')

      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.pointerUp(trigger, { pointerType: 'touch' })
      fireEvent.click(trigger)
      await Promise.resolve()

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('popup-1')).toBe(null)
      expect(onValueChange).not.toHaveBeenCalled()
    })
    it('does not open via keyboard when the trigger is disabled', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(DisabledTrigger, { onValueChange })
      const trigger = screen.getByTestId('trigger-1')

      trigger.focus()
      await user.keyboard('{ArrowDown}')
      await Promise.resolve()

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('popup-1')).toBe(null)
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe('trigger layout measurements', () => {
    it.skipIf(isJSDOM)('handles focus and positioner height', async () => {
      const user = userEvent.setup()
      render(PositionerHeight)

      const overviewButton = screen.getByRole('button', { name: 'Overview' })
      const handbookButton = screen.getByRole('button', { name: 'Handbook' })
      overviewButton.focus()

      await user.keyboard('{ArrowDown}')

      const positioner = screen.getByTestId('positioner')
      const overviewLink = await screen.findByRole('link', { name: 'Quick Start' })
      const overviewHeight = screen.getByTestId('overview-content').offsetHeight

      await waitFor(() => {
        expect(
          Math.abs(
            parseInt(positioner.style.getPropertyValue('--positioner-height'), 10) - overviewHeight
          )
        ).toBeLessThanOrEqual(1)
      })

      await waitFor(() => {
        expect(overviewLink).toHaveFocus()
      })

      await user.tab({ shift: true })

      await waitFor(() => {
        expect(overviewButton).toHaveFocus()
      })

      await user.keyboard('{ArrowRight}')

      await waitFor(() => {
        expect(handbookButton).toHaveFocus()
      })

      await user.keyboard('{ArrowDown}')

      const handbookLink = await screen.findByRole('link', { name: 'Styling components' })
      const handbookHeight = screen.getByTestId('handbook-content').offsetHeight

      await waitFor(() => {
        expect(
          Math.abs(
            parseInt(positioner.style.getPropertyValue('--positioner-height'), 10) - handbookHeight
          )
        ).toBeLessThanOrEqual(1)
      })
      expect(handbookHeight).toBeGreaterThan(overviewHeight)

      await waitFor(() => {
        expect(handbookLink).toHaveFocus()
      })

      await user.tab({ shift: true })

      await waitFor(() => {
        expect(handbookButton).toHaveFocus()
      })

      await user.keyboard('{ArrowLeft}')

      await waitFor(() => {
        expect(overviewButton).toHaveFocus()
      })

      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        expect(
          Math.abs(
            parseInt(positioner.style.getPropertyValue('--positioner-height'), 10) - overviewHeight
          )
        ).toBeLessThanOrEqual(1)
      })
    })

    it.skipIf(isJSDOM)('handles positioner width correctly', async () => {
      render(PositionerWidth)

      const noContentButton = screen.getByRole('button', { name: 'noContent' })
      const withContentButton = screen.getByRole('button', { name: 'withContent' })

      await userEvent.pointer([
        { target: withContentButton },
        { target: noContentButton, releasePrevious: true },
        { target: withContentButton, releasePrevious: true }
      ])

      const link = await screen.findByRole('link', { name: 'Styling components' })
      await waitFor(() => {
        expect(link).toBeVisible()
      })

      const positioner = screen.getByTestId('positioner')
      const contentWidth = (link.parentElement as HTMLElement).offsetWidth

      await waitFor(() => {
        expect(
          Math.abs(
            parseInt(positioner.style.getPropertyValue('--positioner-width'), 10) - contentWidth
          )
        ).toBeLessThanOrEqual(1)
      })
    })

    it.skipIf(isJSDOM)('repositions the positioner when switching triggers via hover', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 })
      render(HorizontalListNavigationMenu)

      const overviewButton = screen.getByRole('button', { name: 'Overview' })
      const handbookButton = screen.getByRole('button', { name: 'Handbook' })

      await user.pointer([{ target: overviewButton }])
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Overview Link' })).toBeVisible()
      })

      const positioner = screen.getByTestId('positioner')
      const firstLeft = positioner.getBoundingClientRect().left

      await user.pointer([{ target: handbookButton, releasePrevious: true }])
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Handbook Link' })).toBeVisible()
      })

      await waitFor(() => {
        const secondLeft = positioner.getBoundingClientRect().left
        expect(Math.abs(secondLeft - firstLeft)).toBeGreaterThan(20)
      })
    })

    it.skipIf(isJSDOM)(
      'does not let a previously hovered trigger reapply popup sizes after a later switch',
      async () => {
        const user = userEvent.setup({ pointerEventsCheck: 0 })
        render(RapidHoverSizing)

        await user.hover(screen.getByRole('button', { name: 'Product' }))

        const popupRoot = await screen.findByTestId('popup-root')
        const setPropertySpy = vi.spyOn(popupRoot.style, 'setProperty')
        const popupWidthCallsSince = (startIndex: number) =>
          setPropertySpy.mock.calls
            .slice(startIndex)
            .filter((call) => call[0] === '--popup-width')
            .map((call) => call[1])

        const productWidth = `${(await screen.findByText('Product panel')).offsetWidth}px`

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe(productWidth)
        })

        const callsBeforeSwitch = setPropertySpy.mock.calls.length

        await user.hover(screen.getByRole('button', { name: 'Solutions' }))

        const solutionsPanel = await screen.findByText('Solutions panel')
        await waitFor(() => {
          expect(solutionsPanel).toBeVisible()
        })
        const solutionsWidth = `${solutionsPanel.offsetWidth}px`

        await waitFor(() => {
          const widthCalls = popupWidthCallsSince(callsBeforeSwitch)
          const solutionsWidthIndex = widthCalls.indexOf(solutionsWidth)

          expect(solutionsWidthIndex).toBeGreaterThan(-1)
          expect(widthCalls.slice(solutionsWidthIndex + 1)).not.toContain(productWidth)
        })

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
        })

        setPropertySpy.mockRestore()
      }
    )

    it.skipIf(isJSDOM)(
      'does not let interrupted mutation resizing reapply popup sizes after a later switch',
      async () => {
        const user = userEvent.setup({ pointerEventsCheck: 0 })
        render(RapidHoverSizing)

        await user.hover(screen.getByRole('button', { name: 'Product' }))

        const popupRoot = await screen.findByTestId('popup-root')
        const positioner = popupRoot.parentElement as HTMLElement
        const setPositionerPropertySpy = vi.spyOn(positioner.style, 'setProperty')
        const positionerWidthCallsSince = (startIndex: number) =>
          setPositionerPropertySpy.mock.calls
            .slice(startIndex)
            .filter((call) => call[0] === '--positioner-width')
            .map((call) => call[1])

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('700px')
        })

        let popupWidth = 700
        let popupHeight = 420
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => popupHeight
        )

        popupRoot.style.setProperty('--popup-width', '700px')
        popupRoot.style.setProperty('--popup-height', '420px')

        popupWidth = 760
        popupHeight = 460
        await user.click(screen.getByRole('button', { name: 'Expand Product' }))

        await waitFor(() => {
          expect(
            setPositionerPropertySpy.mock.calls.some(
              (call) => call[0] === '--positioner-width' && call[1] === '760px'
            )
          ).toBe(true)
        })

        popupWidth = 500
        popupHeight = 320
        const callsBeforeSwitch = setPositionerPropertySpy.mock.calls.length

        await user.hover(screen.getByRole('button', { name: 'Solutions' }))

        await waitFor(() => {
          expect(screen.getByText('Solutions panel')).toBeVisible()
        })

        await waitFor(() => {
          const widthCalls = positionerWidthCallsSince(callsBeforeSwitch)
          const solutionsWidthIndex = widthCalls.indexOf('500px')

          expect(solutionsWidthIndex).toBeGreaterThan(-1)
          expect(widthCalls.slice(solutionsWidthIndex + 1)).not.toContain('760px')
        })

        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px')
        })

        setPositionerPropertySpy.mockRestore()
      }
    )
  })

  describe('top-level safePolygon pointer events', () => {
    it('blocks pointer events on the list while traversing from a top-level trigger to the popup', async () => {
      render(NavigationMenu)
      const trigger = screen.getByTestId('trigger-1')
      const siblingTrigger = screen.getByTestId('trigger-2')
      const topLevelList = trigger.closest('ul') as HTMLElement

      hoverOpen(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('none')
      })
      expect(document.body.style.pointerEvents).toBe('')
      expect(getComputedStyle(siblingTrigger).pointerEvents).toBe('none')

      fireEvent.mouseEnter(screen.getByTestId('top-level-positioner'))

      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('')
      })
    })
    it('reapplies top-level safePolygon pointer events after returning from the popup and switching triggers', async () => {
      render(NavigationMenuWithTopLevelLink)
      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const topLevelLink = screen.getByTestId('top-level-link')
      const topLevelList = trigger1.closest('ul') as HTMLElement

      hoverOpen(trigger1)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const positioner = screen.getByTestId('top-level-positioner')

      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('none')
      })
      expect(getComputedStyle(topLevelLink).pointerEvents).toBe('none')

      fireEvent.mouseEnter(positioner)
      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('')
      })

      fireEvent.mouseLeave(positioner, { relatedTarget: trigger1 })
      hoverOpen(trigger1)
      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('none')
      })

      fireEvent.mouseEnter(positioner)
      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('')
      })

      fireEvent.mouseLeave(positioner, { relatedTarget: trigger2 })
      hoverOpen(trigger2)
      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('none')
      })
      await waitFor(() => {
        expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      })
      expect(screen.queryByTestId('popup-2')).not.toBe(null)
    })
    it('keeps top-level safePolygon pointer events active when switching directly to a different trigger', async () => {
      render(NavigationMenuWithTopLevelLink)
      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const topLevelLink = screen.getByTestId('top-level-link')
      const topLevelList = trigger1.closest('ul') as HTMLElement

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      hoverOpen(trigger2)
      await waitFor(() => {
        expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      })

      expect(topLevelList.style.pointerEvents).toBe('none')
      expect(document.body.style.pointerEvents).toBe('')
      expect(getComputedStyle(trigger1).pointerEvents).toBe('none')
      expect(getComputedStyle(topLevelLink).pointerEvents).toBe('none')
      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('popup-2')).not.toBe(null)
    })
    it('scopes safePolygon pointer events to the document for a custom list element', async () => {
      render(CustomListNavigationMenu)
      const trigger = screen.getByTestId('trigger-1')

      hoverOpen(trigger)
      await waitFor(() => {
        expect(document.body.style.pointerEvents).toBe('none')
      })
      expect(screen.getByTestId('custom-list').style.pointerEvents).toBe('')

      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      expect(document.body.style.pointerEvents).toBe('')

      const secondTrigger = screen.getByTestId('trigger-2')
      hoverOpen(secondTrigger)

      await waitFor(() => {
        expect(secondTrigger).toHaveAttribute('aria-expanded', 'true')
      })
      await waitFor(() => {
        expect(document.body.style.pointerEvents).toBe('none')
      })

      fireEvent.pointerDown(secondTrigger, { pointerType: 'mouse' })
      expect(document.body.style.pointerEvents).toBe('')
    })

    it('clears top-level safePolygon pointer events on trigger pointerdown', async () => {
      render(NavigationMenu)
      const trigger = screen.getByTestId('trigger-1')
      const topLevelList = trigger.closest('ul') as HTMLElement

      hoverOpen(trigger)
      await waitFor(() => {
        expect(topLevelList.style.pointerEvents).toBe('none')
      })

      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })

      expect(topLevelList.style.pointerEvents).toBe('')
    })
    it.skipIf(isJSDOM)(
      'blocks pointer events on sibling top-level triggers when opened through real hover',
      async () => {
        const user = userEvent.setup()
        render(NavigationMenu)
        const trigger = screen.getByTestId('trigger-1')
        const siblingTrigger = screen.getByTestId('trigger-2')
        const topLevelList = trigger.closest('ul') as HTMLElement

        await user.hover(trigger)

        await waitFor(() => {
          expect(topLevelList.style.pointerEvents).toBe('none')
        })
        expect(getComputedStyle(siblingTrigger).pointerEvents).toBe('none')
      }
    )
  })

  it.skipIf(isJSDOM)(
    'releases the pointer-events lock on the list when the open trigger unmounts',
    async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 })
      let navigate = () => {}
      render(ActiveItemDropsTrigger, { register: (fn: () => void) => (navigate = fn) })

      const list = screen.getByTestId('list')
      const triggerA = screen.getByRole('button', { name: 'A' })

      await user.hover(triggerA)
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'A link' })).toBeVisible()
      })
      await waitFor(() => {
        expect(list.style.pointerEvents).toBe('none')
      })

      navigate()
      await tick()

      await waitFor(() => {
        expect(list.style.pointerEvents).toBe('')
      })
    }
  )
})
