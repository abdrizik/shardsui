import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ActivateOnFocusPointer from './fixtures/activate-on-focus-pointer.svelte'
import AnchorTabs from './fixtures/anchor-tabs.svelte'
import BasicTabs from './fixtures/basic-tabs.svelte'
import ControlledTabs from './fixtures/controlled-tabs.svelte'
import TabOutsideList from './fixtures/tab-outside-list.svelte'
import TabStateTabs from './fixtures/tab-state-tabs.svelte'
import TabsActivateOnFocus from './fixtures/tabs-activate-on-focus.svelte'
import TabsNoKeepMounted from './fixtures/tabs-no-keep-mounted.svelte'
import TabsNoValueWithPanels from './fixtures/tabs-no-value-with-panels.svelte'
import TabsWithDisabled from './fixtures/tabs-with-disabled.svelte'
import UncontrolledActivateOnFocus from './fixtures/uncontrolled-activate-on-focus.svelte'

describe('<Tabs.Tab />', () => {
  it('throws a descriptive error when rendered outside <Tabs.List>', () => {
    expect(() => render(TabOutsideList)).toThrow(
      'ShardsUI: this part must be rendered inside <Tabs.List>.'
    )
  })

  describe('keyboard activation', () => {
    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' ']
    ])('activates the focused tab with %s when `activateOnFocus` is false', async (_label, key) => {
      const user = userEvent.setup()
      render(BasicTabs, { value: 0 })

      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      await user.keyboard('{ArrowRight}')

      expect(tabs[1]).toHaveFocus()
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')

      await user.keyboard(key)

      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('pointer navigation', () => {
    it('selects the clicked tab', async () => {
      const user = userEvent.setup()
      render(BasicTabs, { value: 0 })
      const tabs = screen.getAllByRole('tab')

      await user.click(tabs[1])

      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    })

    it('does not change selection when clicking disabled tab', async () => {
      const user = userEvent.setup()
      render(TabsWithDisabled, { disableSecond: true })
      const tabs = screen.getAllByRole('tab')

      await user.click(tabs[1])

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('disabled tabs', () => {
    it('auto-selects first enabled tab when first tab is disabled', () => {
      render(TabsWithDisabled, { disableFirst: true })
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('auto-selects third tab when first two tabs are disabled', () => {
      render(TabsWithDisabled, { disableFirst: true, disableSecond: true })
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('disabled panels are hidden', () => {
      render(TabsWithDisabled, { disableFirst: true })
      const panels = screen.getAllByRole('tabpanel', { hidden: true })
      expect(panels[0]).toHaveAttribute('hidden')
      expect(panels[1]).not.toHaveAttribute('hidden')
    })

    it('ArrowLeft with activateOnFocus=true moves focus to the disabled tab without activating it', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(TabsWithDisabled, {
        value: 2,
        disableSecond: true,
        activateOnFocus: true,
        onValueChange
      })

      const tabs = screen.getAllByRole('tab')
      tabs[2].focus()

      const callsBefore = onValueChange.mock.calls.length
      await user.keyboard('{ArrowLeft}')

      expect(document.activeElement).toBe(tabs[1])
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
      expect(onValueChange.mock.calls.length).toBe(callsBefore)
    })
  })

  it('when activateOnFocus=true — calls onValueChange on pointerdown', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onpointerdown = vi.fn()
    render(ActivateOnFocusPointer, { value: 0, onValueChange, onpointerdown })

    await user.pointer({ keys: '[MouseLeft>]', target: screen.getAllByRole('tab')[1] })

    expect(onValueChange.mock.calls.length).toBe(1)
    expect(onpointerdown.mock.calls.length).toBe(1)
  })

  describe('secondary-button press', () => {
    it('does not activate a disabled tab that is pressed and focused', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(UncontrolledActivateOnFocus, { onValueChange, disabledSecond: true })

      const tabs = screen.getAllByRole('tab')
      await user.pointer({ keys: '[MouseLeft]', target: tabs[1] })
      tabs[1].focus()

      expect(tabs[1]).toHaveFocus()
      expect(onValueChange).not.toHaveBeenCalled()
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('does not activate a tab focused by a held secondary-button press', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(UncontrolledActivateOnFocus, { onValueChange })

      const tabs = screen.getAllByRole('tab')
      await user.pointer({ keys: '[MouseRight>]', target: tabs[1] })
      tabs[1].focus()

      expect(onValueChange).not.toHaveBeenCalled()
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('activates on focus again once a secondary-button press has ended', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(UncontrolledActivateOnFocus, { onValueChange })

      const tabs = screen.getAllByRole('tab')
      await user.pointer({ keys: '[MouseRight]', target: tabs[1] })

      expect(onValueChange).not.toHaveBeenCalled()

      tabs[0].focus()
      await user.keyboard('{ArrowRight}')

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('activates on focus again once a secondary-button press is cancelled', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(UncontrolledActivateOnFocus, { onValueChange })

      const tabs = screen.getAllByRole('tab')
      await fireEvent.pointerDown(tabs[1], { button: 2 })
      await fireEvent.pointerCancel(tabs[1])

      tabs[0].focus()
      await user.keyboard('{ArrowRight}')

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('renders as an anchor and toggles selection', async () => {
    const user = userEvent.setup()
    render(AnchorTabs)

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0].tagName).toBe('A')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')

    await user.click(tabs[1])

    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  describe('state', () => {
    it.skipIf(isJSDOM)(
      'exposes tab activation direction through the children snippet',
      async () => {
        const { rerender } = render(TabStateTabs, { value: 0 })

        await rerender({ value: 1 })

        await waitFor(() => {
          expect(screen.getByTestId('tab-state-1')).toHaveAttribute('data-active', 'true')
        })
        expect(screen.getByTestId('tab-state-1')).toHaveAttribute('data-direction', 'right')
      }
    )
  })

  describe('activateOnFocus: onValueChange fires on focus', () => {
    it('calls onValueChange when an inactive tab receives focus with activateOnFocus=true', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(TabsActivateOnFocus, { value: 0, onValueChange, activateOnFocus: true })

      const tabs = screen.getAllByRole('tab')

      tabs[0].focus()
      expect(onValueChange).toHaveBeenCalledTimes(0)

      await user.keyboard('{ArrowRight}')
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toBe(1)
    })
  })

  describe('keepMounted=false aria-controls sync', () => {
    it('sets aria-controls on the active tab and removes it from inactive tabs', async () => {
      const user = userEvent.setup()
      render(TabsNoKeepMounted, { value: 0 })

      const tabs = screen.getAllByRole('tab')
      const [firstPanel] = screen.getAllByRole('tabpanel')

      expect(tabs[0]).toHaveAttribute('aria-controls', firstPanel.id)
      expect(tabs[1]).not.toHaveAttribute('aria-controls')

      await user.click(tabs[1])

      const [secondPanel] = screen.getAllByRole('tabpanel')
      expect(secondPanel).toHaveTextContent('Panel 1')
      expect(tabs[0]).not.toHaveAttribute('aria-controls')
      expect(tabs[1]).toHaveAttribute('aria-controls', secondPanel.id)
    })
  })

  describe('tabindex=0 highlight follows external controlled value change', () => {
    it('when focus is outside the tablist — tabindex=0 moves to the newly active tab', async () => {
      const { rerender } = render(ControlledTabs, { value: 0 })
      const tabs = screen.getAllByRole('tab')

      expect(tabs[0]).toHaveAttribute('tabindex', '0')
      expect(tabs[1]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '-1')

      await rerender({ value: 2 })

      expect(tabs[0]).toHaveAttribute('tabindex', '-1')
      expect(tabs[1]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '0')
    })
  })

  describe('disabled tab tabindex when programmatically selected', () => {
    it('does not set tabindex=0 on a disabled tab when it is programmatically selected', async () => {
      const { rerender } = render(TabsWithDisabled, { value: 1, disableFirst: true })
      const tabs = screen.getAllByRole('tab')

      expect(tabs[1]).toHaveAttribute('tabindex', '0')
      expect(tabs[0]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '-1')

      await rerender({ value: 0, disableFirst: true })

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('tabindex', '-1')
      expect(tabs[1]).toHaveAttribute('tabindex', '0')
    })
  })

  describe('aria-controls when no initial value (keepMounted panels)', () => {
    it('sets aria-controls and aria-labelledby on both tabs when no initial value is given', () => {
      render(TabsNoValueWithPanels)
      const tabs = screen.getAllByRole('tab')
      const panels = screen.getAllByRole('tabpanel', { hidden: true })

      expect(tabs[0]).toHaveAttribute('aria-controls', panels[0].id)
      expect(tabs[1]).toHaveAttribute('aria-controls', panels[1].id)
      expect(panels[0]).toHaveAttribute('aria-labelledby', tabs[0].id)
      expect(panels[1]).toHaveAttribute('aria-labelledby', tabs[1].id)
    })
  })

  describe('highlight sync: arrow keys continue from focused tab after external value change', () => {
    it('ArrowRight continues from the highlighted (focused) tab when value changes externally', async () => {
      const { rerender } = render(ControlledTabs, { value: 0 })
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()

      await rerender({ value: 2 })

      expect(tabs[0]).toHaveAttribute('tabindex', '0')
      expect(tabs[1]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')

      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })

      expect(document.activeElement).toBe(tabs[1])
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('highlight sync after keyboard navigation', () => {
    it('tabindex=0 still follows an external value change once a tab has been navigated away from', async () => {
      const user = userEvent.setup()
      const { rerender } = render(ControlledTabs, { value: 0 })
      const tabs = screen.getAllByRole('tab')

      tabs[0].focus()
      await user.keyboard('{ArrowRight}')

      expect(tabs[1]).toHaveFocus()
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')

      tabs[1].blur()

      await rerender({ value: 2 })
      await rerender({ value: 0 })

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('tabindex', '0')
      expect(tabs[1]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '-1')
    })
  })
})
