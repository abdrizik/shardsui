import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AddAndSelectTabs from './fixtures/add-and-select-tabs.svelte'
import AllDisabledTabs from './fixtures/all-disabled-tabs.svelte'
import AsTabs from './fixtures/as-tabs.svelte'
import AsyncControlledTabs from './fixtures/async-controlled-tabs.svelte'
import BasicTabs from './fixtures/basic-tabs.svelte'
import ClearableIndicatorTabs from './fixtures/clearable-indicator-tabs.svelte'
import ControlledTabs from './fixtures/controlled-tabs.svelte'
import DecliningAutoTabs from './fixtures/declining-auto-tabs.svelte'
import DecliningTabs from './fixtures/declining-tabs.svelte'
import DialogTabs from './fixtures/dialog-tabs.svelte'
import DuplicateValueTabs from './fixtures/duplicate-value-tabs.svelte'
import DynamicPanels from './fixtures/dynamic-panels.svelte'
import EmptyRoot from './fixtures/empty-root.svelte'
import ImplicitSelectionLater from './fixtures/implicit-selection-later.svelte'
import KeyboardMatrixTabs from './fixtures/keyboard-matrix-tabs.svelte'
import MixedValueTypesTabs from './fixtures/mixed-value-types-tabs.svelte'
import NestedTabs from './fixtures/nested-tabs.svelte'
import NullChildTabs from './fixtures/null-child-tabs.svelte'
import PopoverTabs from './fixtures/popover-tabs.svelte'
import TabsAriaRelationship from './fixtures/tabs-aria-relationship.svelte'
import TabsDynamicEnableSecond from './fixtures/tabs-dynamic-enable-second.svelte'
import TabsDynamicSingleTab from './fixtures/tabs-dynamic-single-tab.svelte'
import TabsDynamic from './fixtures/tabs-dynamic.svelte'
import TabsMissingValue from './fixtures/tabs-missing-value.svelte'
import TabsNoValue from './fixtures/tabs-no-value.svelte'
import TabsNullValue from './fixtures/tabs-null-value.svelte'
import TabsWithDisabled from './fixtures/tabs-with-disabled.svelte'
import UninitializedBoundValue from './fixtures/uninitialized-bound-value.svelte'
import VerticalTabs from './fixtures/vertical-tabs.svelte'

describe('<Tabs.Root />', () => {
  describe('prop: as', () => {
    it.each([
      ['root', 'rootAs', 'section'],
      ['list', 'listAs', 'nav'],
      ['tab', 'tabAs', 'a'],
      ['indicator', 'indicatorAs', 'div'],
      ['panel', 'panelAs', 'section']
    ])('%s renders a custom element', (part, prop, tag) => {
      render(AsTabs, { [prop]: tag })
      expect(screen.getByTestId(part).tagName.toLowerCase()).toBe(tag)
    })
  })

  describe('ARIA', () => {
    it('tablist does not have aria-orientation by default', () => {
      render(BasicTabs)
      expect(screen.getByRole('tablist')).not.toHaveAttribute('aria-orientation')
    })

    it('vertical tablist has aria-orientation=vertical', () => {
      render(VerticalTabs)
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('active tab has aria-selected=true', () => {
      render(BasicTabs, { value: 0 })
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('sets aria-labelledby correctly when panels are in non-tab order', () => {
      render(TabsAriaRelationship)
      const tabs = screen.getAllByRole('tab')
      const panels = screen.getAllByRole('tabpanel', { hidden: true })

      expect(panels[0]).toHaveAttribute('aria-labelledby', tabs[1].id)
      expect(panels[1]).toHaveAttribute('aria-labelledby', tabs[0].id)
      expect(panels[2]).toHaveAttribute('aria-labelledby', tabs[2].id)
      expect(panels[3]).toHaveAttribute('aria-labelledby', tabs[3].id)
    })

    it('sets aria-controls correctly when panels are in non-tab order', () => {
      render(TabsAriaRelationship)
      const tabs = screen.getAllByRole('tab')
      const panels = screen.getAllByRole('tabpanel', { hidden: true })

      expect(tabs[0]).toHaveAttribute('aria-controls', panels[1].id)
      expect(tabs[1]).toHaveAttribute('aria-controls', panels[0].id)
      expect(tabs[2]).toHaveAttribute('aria-controls', panels[2].id)
      expect(tabs[3]).toHaveAttribute('aria-controls', panels[3].id)
    })
  })

  describe('initial value', () => {
    it('second tab selected when value=1', () => {
      render(BasicTabs, { value: 1 })
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
    })

    it('puts the selected tab in tab order (tabindex=0)', () => {
      render(BasicTabs, { value: 1 })
      const tabs = screen.getAllByRole('tab')
      expect(tabs[1]).toHaveAttribute('tabindex', '0')
      expect(tabs[0]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '-1')
    })

    it('reports the implicit initial selection through an uninitialized binding', async () => {
      render(UninitializedBoundValue)

      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')
      await waitFor(() => expect(screen.getByTestId('bound-value')).toHaveTextContent('0'))
    })

    it('supports values of different types', async () => {
      const user = userEvent.setup()
      render(MixedValueTypesTabs)

      const tabs = screen.getAllByRole('tab')
      const panels = screen.getAllByRole('tabpanel', { hidden: true })

      for (const [index, tab] of tabs.entries()) {
        expect(panels[index]).toHaveAttribute('aria-labelledby', tab.id)

        await user.click(tab)

        expect(panels[index]).not.toHaveAttribute('hidden')
        for (const [otherIndex, otherPanel] of panels.entries()) {
          if (otherIndex !== index) expect(otherPanel).toHaveAttribute('hidden')
        }
      }
    })
  })

  describe('controlled value', () => {
    it('does not fire onValueChange on mount with controlled roots', () => {
      const onValueChange = vi.fn()
      render(ControlledTabs, { value: 1, onValueChange })
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('keeps a disabled controlled value instead of auto-falling back', () => {
      const onValueChange = vi.fn()
      render(TabsWithDisabled, { value: 0, disableFirst: true, onValueChange })
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('honors an explicit value prop even if it points to a disabled tab', () => {
      render(ControlledTabs, { value: 0, disableFirst: true })
      const tabs = screen.getAllByRole('tab')

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('onValueChange callback', () => {
    it('fires onValueChange when a different tab is clicked', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicTabs, { value: 0, onValueChange })

      const tabs = screen.getAllByRole('tab')
      await user.click(tabs[1])

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toBe(1)
    })

    it('does not call onValueChange on non-main button clicks', async () => {
      const onValueChange = vi.fn()
      render(KeyboardMatrixTabs, { value: 0, onValueChange })

      await fireEvent.click(screen.getAllByRole('tab')[1], { button: 2 })

      expect(onValueChange.mock.calls.length).toBe(0)
    })

    it('when `activateOnFocus = false` does not call onValueChange if an unactive tab gets focused', () => {
      const onValueChange = vi.fn()
      render(KeyboardMatrixTabs, { value: 1, activateOnFocus: false, onValueChange })

      const [firstTab] = screen.getAllByRole('tab')
      firstTab.focus()

      expect(onValueChange.mock.calls.length).toBe(0)
    })

    it('does not fire onValueChange when clicking the already-active tab', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicTabs, { value: 0, onValueChange })

      const tabs = screen.getAllByRole('tab')
      await user.click(tabs[0])

      expect(onValueChange).toHaveBeenCalledTimes(0)
    })

    it('fires onValueChange when first tab is disabled and auto-selects second', () => {
      const onValueChange = vi.fn()
      render(TabsWithDisabled, { disableFirst: true, onValueChange })

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toBe(1)
    })

    it('does not change the selected tab when the event is canceled', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(DecliningTabs, { allowChange: false, onValueChange })

      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')

      await user.click(tabs[1])

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toBe(1)
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('applies automatic value changes even when the binding declines them', () => {
      const onValueChange = vi.fn()
      render(DecliningAutoTabs, { onValueChange })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toBe(1)

      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('calls onValueChange when auto-selecting the first tab on mount', () => {
    const onValueChange = vi.fn()
    render(TabsNoValue, { onValueChange })

    expect(onValueChange.mock.calls.length).toBe(1)
    expect(onValueChange.mock.calls[0][0]).toBe(0)

    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onValueChange with the selected value when the implicit default matches a later tab', () => {
    const onValueChange = vi.fn()
    render(ImplicitSelectionLater, { onValueChange })

    expect(onValueChange.mock.calls.length).toBe(1)
    expect(onValueChange.mock.calls[0][0]).toBe(0)

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onValueChange when the selected tab becomes disabled', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(TabsDynamic, { onValueChange })

    expect(onValueChange.mock.calls.length).toBe(1)
    expect(onValueChange.mock.calls[0][0]).toBe(0)

    await rerender({ disableFirst: true, onValueChange })

    expect(onValueChange.mock.calls.length).toBe(2)
    expect(onValueChange.mock.calls[1][0]).toBe(1)

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('does not call onValueChange when a controlled selected tab becomes disabled', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(TabsDynamic, { value: 0, onValueChange })

    await rerender({ value: 0, disableFirst: true, onValueChange })

    expect(onValueChange).not.toHaveBeenCalled()
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onValueChange when the selected tab becomes disabled with keepMounted panels', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(DynamicPanels, { onValueChange })

    await rerender({ disableFirst: true, onValueChange })

    await waitFor(() => {
      expect(onValueChange.mock.calls.length).toBe(2)
    })
    expect(onValueChange.mock.calls[0][0]).toBe(0)
    expect(onValueChange.mock.calls[1][0]).toBe(1)

    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels[0]).toHaveAttribute('hidden')
    expect(panels[1]).not.toHaveAttribute('hidden')
  })

  it('works inside Dialog', async () => {
    const user = userEvent.setup()
    render(DialogTabs)

    await user.click(screen.getByRole('button', { name: 'Open' }))

    const tab1 = screen.getByRole('tab', { name: 'Overview' })
    await waitFor(() => {
      expect(tab1).toHaveFocus()
    })

    await user.keyboard('{ArrowRight}')

    const tab2 = screen.getByRole('tab', { name: 'Projects' })
    await waitFor(() => {
      expect(tab2).toHaveFocus()
    })
  })

  it('works inside Popover', async () => {
    const user = userEvent.setup()
    render(PopoverTabs)

    await user.click(screen.getByRole('button', { name: 'Open' }))

    const tab1 = screen.getByRole('tab', { name: 'Overview' })
    await waitFor(() => {
      expect(tab1).toHaveFocus()
    })

    await user.keyboard('{ArrowRight}')

    const tab2 = screen.getByRole('tab', { name: 'Projects' })
    await waitFor(() => {
      expect(tab2).toHaveFocus()
    })
  })

  describe('prop: children', () => {
    it('accepts an empty conditional child', () => {
      render(NullChildTabs)
      expect(screen.getAllByRole('tab')).toHaveLength(1)
    })

    it('supports empty children', () => {
      expect(() => render(EmptyRoot)).not.toThrow()
      expect(screen.getByTestId('root')).toBeInTheDocument()
    })
  })

  describe('all tabs disabled: no selection', () => {
    it('does not select any tab when all tabs are disabled', () => {
      render(AllDisabledTabs)
      const tabs = screen.getAllByRole('tab')
      const panels = screen.getAllByRole('tabpanel', { hidden: true })
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
      expect(panels[0]).toHaveAttribute('hidden')
      expect(panels[1]).toHaveAttribute('hidden')
      expect(panels[2]).toHaveAttribute('hidden')
    })

    it('calls onValueChange with null when all tabs are initially disabled', () => {
      const onValueChange = vi.fn()
      render(AllDisabledTabs, { onValueChange })

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toBe(null)
    })
  })

  describe('value={null}', () => {
    it('does not select any tab when value is null', () => {
      render(TabsNullValue)
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('does not call onValueChange on initial render when value is null', () => {
      const onValueChange = vi.fn()
      render(TabsNullValue, { onValueChange })
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe('onValueChange when selected tab is removed', () => {
    it('fires onValueChange when the selected tab is removed (auto fallback)', async () => {
      const onValueChange = vi.fn()
      const { rerender } = render(TabsDynamic, { onValueChange })

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toBe(0)

      await rerender({ showFirst: false, onValueChange })

      expect(onValueChange.mock.calls.length).toBe(2)
      expect(onValueChange.mock.calls[1][0]).toBe(1)

      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveTextContent('Tab 1')
    })

    it('does not call onValueChange when a controlled selected tab is removed', async () => {
      const onValueChange = vi.fn()
      const { rerender } = render(TabsDynamic, { value: 0, onValueChange })

      await rerender({ value: 0, showFirst: false, onValueChange })

      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('onValueChange when selected value is never present in tabs', () => {
    it('fires onValueChange when the implicit default (0) matches no tab (tabs start at value=1)', () => {
      const onValueChange = vi.fn()
      render(TabsMissingValue, { onValueChange })

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toBe(1)

      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('automatic fallback', () => {
    it('does not emit a second change when the fallback resolves to the current value', () => {
      const onValueChange = vi.fn()
      render(DuplicateValueTabs, { onValueChange })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toBe('a')
    })
  })

  describe('nested tabs', () => {
    it('keeps a nested root independent from the one hosting its panel', async () => {
      const user = userEvent.setup()
      render(NestedTabs)

      const [outerTab1, outerTab2] = within(screen.getByTestId('outer-list')).getAllByRole('tab')
      const [innerTab1, innerTab2] = within(screen.getByTestId('inner-list')).getAllByRole('tab')

      const outerPanel1 = screen.getByTestId('outer-panel-1')
      const innerPanel1 = screen.getByText('Inner panel 1')

      expect(outerTab1).toHaveAttribute('aria-controls', outerPanel1.id)
      expect(innerTab1).toHaveAttribute('aria-controls', innerPanel1.id)
      expect(innerPanel1).toHaveAttribute('aria-labelledby', innerTab1.id)

      innerTab1.focus()
      await user.keyboard('{ArrowRight}')

      expect(innerTab2).toHaveFocus()
      expect(innerTab2).toHaveAttribute('aria-selected', 'false')

      await user.keyboard('{Enter}')

      expect(innerTab2).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Inner panel 2')).not.toHaveAttribute('hidden')
      expect(outerTab1).toHaveAttribute('aria-selected', 'true')
      expect(outerTab2).toHaveAttribute('aria-selected', 'false')

      await user.click(outerTab2)

      expect(screen.queryByTestId('inner-list')).toBeNull()
      expect(screen.getByText('Outer panel 2')).not.toHaveAttribute('hidden')
    })
  })

  describe('controlled async activation', () => {
    it.each([true, false])(
      'keeps controlled async activation and focus aligned with activateOnFocus=%s',
      async (activateOnFocus) => {
        const user = userEvent.setup()
        const onValueChange = vi.fn()
        render(AsyncControlledTabs, { activateOnFocus, onValueChange })

        const [firstTab, disabledTab, thirdTab] = screen.getAllByRole('tab')

        firstTab.focus()
        await user.keyboard('{ArrowRight}')
        expect(disabledTab).toHaveFocus()
        expect(firstTab).toHaveAttribute('aria-selected', 'true')

        await user.keyboard('{ArrowRight}')
        expect(thirdTab).toHaveFocus()

        if (!activateOnFocus) {
          expect(onValueChange).not.toHaveBeenCalled()
          await user.keyboard('{Enter}')
        }

        await waitFor(() => expect(thirdTab).toHaveAttribute('aria-selected', 'true'))
        expect(thirdTab).toHaveFocus()
        expect(onValueChange).toHaveBeenCalledWith(2)
      }
    )
  })

  describe('does not re-fire onValueChange when disabled tab becomes enabled', () => {
    it('does not emit a second onValueChange when an enabled tab appears after all tabs were disabled', async () => {
      const onValueChange = vi.fn()
      const { rerender } = render(TabsDynamicEnableSecond, { onValueChange, enableSecond: false })

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toBe(null)

      await rerender({ onValueChange, enableSecond: true })

      expect(onValueChange.mock.calls.length).toBe(1)
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('onValueChange with null when selected tab removed and none remain', () => {
    it('fires onValueChange with null when the last tab is removed', async () => {
      const onValueChange = vi.fn()
      const { rerender } = render(TabsDynamicSingleTab, { onValueChange, showTab: true })

      expect(onValueChange.mock.calls.length).toBe(1)
      expect(onValueChange.mock.calls[0][0]).toBe(0)

      await rerender({ onValueChange, showTab: false })

      expect(onValueChange.mock.calls.length).toBe(2)
      expect(onValueChange.mock.calls[1][0]).toBe(null)

      expect(screen.queryAllByRole('tab')).toHaveLength(0)
      const panel = screen.getByRole('tabpanel', { hidden: true })
      expect(panel).toHaveAttribute('hidden')
    })
  })

  describe('keyboard navigation when focus is on a tab', () => {
    const cells = [
      ['horizontal', 'ltr', 'ArrowLeft', 'ArrowRight'],
      ['horizontal', 'rtl', 'ArrowRight', 'ArrowLeft'],
      ['vertical', 'ltr', 'ArrowUp', 'ArrowDown']
    ] as const

    for (const [orientation, direction, previousItemKey, nextItemKey] of cells) {
      describe.skipIf(isJSDOM && direction === 'rtl')(
        `when focus is on a tab element in a ${orientation} ${direction} tablist`,
        () => {
          describe(previousItemKey, () => {
            describe('with `activateOnFocus = false`', () => {
              it('moves focus to the last tab without activating it if focus is on the first tab', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 0,
                  activateOnFocus: false,
                  onValueChange,
                  onkeydown
                })

                const [firstTab, , lastTab] = screen.getAllByRole('tab')
                firstTab.focus()

                await fireEvent.keyDown(firstTab, { key: previousItemKey })

                expect(lastTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })

              it('moves focus to the previous tab without activating it', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 1,
                  activateOnFocus: false,
                  onValueChange,
                  onkeydown
                })

                const [firstTab, secondTab] = screen.getAllByRole('tab')
                secondTab.focus()

                await fireEvent.keyDown(secondTab, { key: previousItemKey })

                expect(firstTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })

              it('moves focus to a disabled tab without activating it', async () => {
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 2,
                  activateOnFocus: false,
                  disabledIndex: 1,
                  onkeydown
                })

                const [, disabledTab, lastTab] = screen.getAllByRole('tab')
                lastTab.focus()

                await fireEvent.keyDown(lastTab, { key: previousItemKey })

                expect(disabledTab).toHaveFocus()
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })
            })

            describe('with `activateOnFocus = true`', () => {
              it('moves focus to the last tab while activating it if focus is on the first tab', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 0,
                  activateOnFocus: true,
                  onValueChange,
                  onkeydown
                })

                const [firstTab, , lastTab] = screen.getAllByRole('tab')
                firstTab.focus()

                await fireEvent.keyDown(firstTab, { key: previousItemKey })

                expect(lastTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(1)
                expect(onValueChange.mock.calls[0][0]).toBe(2)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })

              it('moves focus to the previous tab while activating it', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 1,
                  activateOnFocus: true,
                  onValueChange,
                  onkeydown
                })

                const [firstTab, secondTab] = screen.getAllByRole('tab')
                secondTab.focus()

                await fireEvent.keyDown(secondTab, { key: previousItemKey })

                expect(firstTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(1)
                expect(onValueChange.mock.calls[0][0]).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })
            })

            it('moves focus to a disabled tab without activating it', async () => {
              const onkeydown = vi.fn()
              render(KeyboardMatrixTabs, {
                direction,
                orientation,
                value: 2,
                disabledIndex: 1,
                onkeydown
              })

              const [, disabledTab, lastTab] = screen.getAllByRole('tab')
              lastTab.focus()

              await fireEvent.keyDown(lastTab, { key: previousItemKey })

              expect(disabledTab).toHaveFocus()
              expect(onkeydown.mock.calls.length).toBe(1)
              expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
            })
          })

          describe(nextItemKey, () => {
            describe('with `activateOnFocus = false`', () => {
              it('moves focus to the first tab without activating it if focus is on the last tab', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 2,
                  activateOnFocus: false,
                  onValueChange,
                  onkeydown
                })

                const [firstTab, , lastTab] = screen.getAllByRole('tab')
                lastTab.focus()

                await fireEvent.keyDown(lastTab, { key: nextItemKey })

                expect(firstTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })

              it('moves focus to the next tab without activating it', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 1,
                  activateOnFocus: false,
                  onValueChange,
                  onkeydown
                })

                const [, secondTab, lastTab] = screen.getAllByRole('tab')
                secondTab.focus()

                await fireEvent.keyDown(secondTab, { key: nextItemKey })

                expect(lastTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })

              it('moves focus to a disabled tab without activating it', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 0,
                  activateOnFocus: false,
                  disabledIndex: 1,
                  onValueChange,
                  onkeydown
                })

                const [firstTab, disabledTab, thirdTab] = screen.getAllByRole('tab')
                firstTab.focus()

                await fireEvent.keyDown(firstTab, { key: nextItemKey })

                expect(disabledTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)

                await fireEvent.keyDown(disabledTab, { key: nextItemKey })
                expect(thirdTab).toHaveFocus()
              })
            })

            describe('with `activateOnFocus = true`', () => {
              it('moves focus to the first tab while activating it if focus is on the last tab', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 2,
                  activateOnFocus: true,
                  onValueChange,
                  onkeydown
                })

                const [firstTab, , lastTab] = screen.getAllByRole('tab')
                lastTab.focus()

                await fireEvent.keyDown(lastTab, { key: nextItemKey })

                expect(firstTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(1)
                expect(onValueChange.mock.calls[0][0]).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })

              it('moves focus to the next tab while activating it', async () => {
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 1,
                  activateOnFocus: true,
                  onValueChange,
                  onkeydown
                })

                const [, secondTab, lastTab] = screen.getAllByRole('tab')
                secondTab.focus()

                await fireEvent.keyDown(secondTab, { key: nextItemKey })

                expect(lastTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(1)
                expect(onValueChange.mock.calls[0][0]).toBe(2)
                expect(onkeydown.mock.calls.length).toBe(1)
                expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
              })
            })

            it('moves focus to a disabled tab without activating it', async () => {
              const onValueChange = vi.fn()
              const onkeydown = vi.fn()
              render(KeyboardMatrixTabs, {
                direction,
                orientation,
                value: 0,
                disabledIndex: 1,
                onValueChange,
                onkeydown
              })

              const [firstTab, disabledTab, thirdTab] = screen.getAllByRole('tab')
              firstTab.focus()

              await fireEvent.keyDown(firstTab, { key: nextItemKey })

              expect(disabledTab).toHaveFocus()
              expect(onValueChange.mock.calls.length).toBe(0)
              expect(onkeydown.mock.calls.length).toBe(1)
              expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)

              await fireEvent.keyDown(disabledTab, { key: nextItemKey })
              expect(thirdTab).toHaveFocus()
            })
          })

          describe('modifier keys', () => {
            for (const modifierKey of ['Shift', 'Control', 'Alt', 'Meta']) {
              it(`does not move focus when modifier key: ${modifierKey} is pressed`, async () => {
                const user = userEvent.setup()
                const onValueChange = vi.fn()
                const onkeydown = vi.fn()
                render(KeyboardMatrixTabs, {
                  direction,
                  orientation,
                  value: 0,
                  onValueChange,
                  onkeydown
                })

                const [firstTab] = screen.getAllByRole('tab')

                await user.keyboard('[Tab]')
                expect(firstTab).toHaveFocus()

                await user.keyboard(`{${modifierKey}>}{${nextItemKey}}`)
                expect(firstTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(2)

                await user.keyboard(`{${modifierKey}>}{${previousItemKey}}`)
                expect(firstTab).toHaveFocus()
                expect(onValueChange.mock.calls.length).toBe(0)
                expect(onkeydown.mock.calls.length).toBe(4)
              })
            }
          })
        }
      )
    }

    describe('when focus is on a tab regardless of orientation', () => {
      describe('Home', () => {
        it('when `activateOnFocus = false`, moves focus to the first tab without activating it', async () => {
          const onValueChange = vi.fn()
          const onkeydown = vi.fn()
          render(KeyboardMatrixTabs, { value: 2, activateOnFocus: false, onValueChange, onkeydown })

          const [firstTab, , lastTab] = screen.getAllByRole('tab')
          lastTab.focus()

          await fireEvent.keyDown(lastTab, { key: 'Home' })

          expect(firstTab).toHaveFocus()
          expect(onValueChange.mock.calls.length).toBe(0)
          expect(onkeydown.mock.calls.length).toBe(1)
          expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
        })

        it('when `activateOnFocus = true`, moves focus to the first tab while activating it', async () => {
          const onValueChange = vi.fn()
          const onkeydown = vi.fn()
          render(KeyboardMatrixTabs, { value: 2, activateOnFocus: true, onValueChange, onkeydown })

          const [firstTab, , lastTab] = screen.getAllByRole('tab')
          lastTab.focus()

          await fireEvent.keyDown(lastTab, { key: 'Home' })

          expect(firstTab).toHaveFocus()
          expect(onValueChange.mock.calls.length).toBe(1)
          expect(onValueChange.mock.calls[0][0]).toBe(0)
          expect(onkeydown.mock.calls.length).toBe(1)
          expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
        })

        for (const activateOnFocus of [false, true]) {
          it(`when \`activateOnFocus = ${activateOnFocus}\`, moves focus to a disabled tab without activating it`, async () => {
            const onValueChange = vi.fn()
            const onkeydown = vi.fn()
            render(KeyboardMatrixTabs, {
              value: 2,
              activateOnFocus,
              disabledIndex: 0,
              onValueChange,
              onkeydown
            })

            const [disabledTab, , lastTab] = screen.getAllByRole('tab')
            lastTab.focus()

            await fireEvent.keyDown(lastTab, { key: 'Home' })

            expect(disabledTab).toHaveFocus()
            expect(onValueChange.mock.calls.length).toBe(0)
            expect(onkeydown.mock.calls.length).toBe(1)
            expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
          })
        }
      })

      describe('End', () => {
        it('when `activateOnFocus = false`, moves focus to the last tab without activating it', async () => {
          const onValueChange = vi.fn()
          const onkeydown = vi.fn()
          render(KeyboardMatrixTabs, { value: 0, activateOnFocus: false, onValueChange, onkeydown })

          const [firstTab, , lastTab] = screen.getAllByRole('tab')
          firstTab.focus()

          await fireEvent.keyDown(firstTab, { key: 'End' })

          expect(lastTab).toHaveFocus()
          expect(onValueChange.mock.calls.length).toBe(0)
          expect(onkeydown.mock.calls.length).toBe(1)
          expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
        })

        it('when `activateOnFocus = true`, moves focus to the last tab while activating it', async () => {
          const onValueChange = vi.fn()
          const onkeydown = vi.fn()
          render(KeyboardMatrixTabs, { value: 0, activateOnFocus: true, onValueChange, onkeydown })

          const [firstTab, , lastTab] = screen.getAllByRole('tab')
          firstTab.focus()

          await fireEvent.keyDown(firstTab, { key: 'End' })

          expect(lastTab).toHaveFocus()
          expect(onValueChange.mock.calls.length).toBe(1)
          expect(onValueChange.mock.calls[0][0]).toBe(2)
          expect(onkeydown.mock.calls.length).toBe(1)
          expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
        })

        for (const activateOnFocus of [false, true]) {
          it(`when \`activateOnFocus = ${activateOnFocus}\`, moves focus to a disabled tab without activating it`, async () => {
            const onValueChange = vi.fn()
            const onkeydown = vi.fn()
            render(KeyboardMatrixTabs, {
              value: 0,
              activateOnFocus,
              disabledIndex: 2,
              onValueChange,
              onkeydown
            })

            const [firstTab, , disabledTab] = screen.getAllByRole('tab')
            firstTab.focus()

            await fireEvent.keyDown(firstTab, { key: 'End' })

            expect(disabledTab).toHaveFocus()
            expect(onValueChange.mock.calls.length).toBe(0)
            expect(onkeydown.mock.calls.length).toBe(1)
            expect(onkeydown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
          })
        }
      })
    })
  })

  describe.skipIf(isJSDOM)('activation direction', () => {
    it('keeps activation direction none after automatic disabled fallback', async () => {
      const { rerender } = render(DynamicPanels, {})

      await rerender({ disableFirst: true })

      await waitFor(() => {
        expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
      })
      expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'none')
    })

    it('sets data-activation-direction on the root with orientation=horizontal', async () => {
      const user = userEvent.setup()
      render(BasicTabs, { value: 0 })

      const root = screen.getByTestId('root')
      const tabs = screen.getAllByRole('tab')

      expect(root).toHaveAttribute('data-activation-direction', 'none')

      await user.click(tabs[1])
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'right')
      })

      await user.click(tabs[0])
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'left')
      })
    })

    it('sets data-activation-direction on the root with orientation=vertical', async () => {
      const user = userEvent.setup()
      render(VerticalTabs, { value: 0 })

      const root = screen.getByTestId('root')
      const tabs = screen.getAllByRole('tab')

      expect(root).toHaveAttribute('data-activation-direction', 'none')

      await user.click(tabs[1])
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'down')
      })

      await user.click(tabs[0])
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'up')
      })
    })

    it('updates data-activation-direction on programmatic value changes with orientation=horizontal', async () => {
      const { rerender } = render(ControlledTabs, { value: 0 })

      const root = screen.getByTestId('root')
      const tabs = screen.getAllByRole('tab')
      expect(root).toHaveAttribute('data-activation-direction', 'none')
      expect(tabs[0]).toHaveAttribute('data-activation-direction', 'none')

      await rerender({ value: 1 })
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'right')
      })
      expect(tabs[0]).toHaveAttribute('data-activation-direction', 'right')
      expect(tabs[1]).toHaveAttribute('data-activation-direction', 'right')

      await rerender({ value: 0 })
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'left')
      })
      expect(tabs[0]).toHaveAttribute('data-activation-direction', 'left')
      expect(tabs[1]).toHaveAttribute('data-activation-direction', 'left')
    })

    it('resets data-activation-direction when the selection is cleared and restored', async () => {
      const { rerender } = render(ClearableIndicatorTabs, { value: 0 })

      const root = screen.getByTestId('root')

      await rerender({ value: 1 })
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'right')
      })

      await rerender({ value: null })
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'none')
      })
      expect(screen.queryByTestId('indicator')).toBeNull()

      await rerender({ value: 0 })
      await waitFor(() => {
        expect(screen.queryByTestId('indicator')).not.toBeNull()
      })
      expect(root).toHaveAttribute('data-activation-direction', 'none')
    })

    it('updates data-activation-direction on programmatic value changes with orientation=vertical', async () => {
      const { rerender } = render(VerticalTabs, { value: 0 })

      const root = screen.getByTestId('root')
      const tabs = screen.getAllByRole('tab')
      expect(root).toHaveAttribute('data-activation-direction', 'none')
      expect(tabs[0]).toHaveAttribute('data-activation-direction', 'none')

      await rerender({ value: 1 })
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'down')
      })
      expect(tabs[0]).toHaveAttribute('data-activation-direction', 'down')
      expect(tabs[1]).toHaveAttribute('data-activation-direction', 'down')

      await rerender({ value: 0 })
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'up')
      })
      expect(tabs[0]).toHaveAttribute('data-activation-direction', 'up')
      expect(tabs[1]).toHaveAttribute('data-activation-direction', 'up')
    })

    it('computes the direction on a programmatic change after a controlled parent ignores a click', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const { rerender } = render(ControlledTabs, { value: 0, onValueChange })

      const root = screen.getByTestId('root')

      await user.click(screen.getAllByRole('tab')[1])
      expect(onValueChange).toHaveBeenCalledWith(1)

      await rerender({ value: 1, onValueChange })

      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'right')
      })
    })

    it('keeps the direction unchanged when a value change is declined', async () => {
      const user = userEvent.setup()
      const { rerender } = render(DecliningTabs, { value: 0, allowChange: false })

      const root = screen.getByTestId('root')
      const tabs = screen.getAllByRole('tab')

      await user.click(tabs[1])

      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(root).toHaveAttribute('data-activation-direction', 'none')
      expect(screen.getByRole('tablist')).toHaveAttribute('data-activation-direction', 'none')
      expect(tabs[0]).toHaveAttribute('data-activation-direction', 'none')

      await rerender({ value: 1, allowChange: false })

      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'right')
      })
    })

    it('computes the direction when a tab is added and selected in one update', async () => {
      const user = userEvent.setup()
      render(AddAndSelectTabs)

      const root = screen.getByTestId('root')
      expect(root).toHaveAttribute('data-activation-direction', 'none')

      await user.click(screen.getByRole('button', { name: 'Add and Select' }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: '2' })).toHaveAttribute('aria-selected', 'true')
      })
      expect(root).toHaveAttribute('data-activation-direction', 'right')
    })

    it('recomputes the direction from DOM order for out of order string values', async () => {
      const user = userEvent.setup()
      render(AddAndSelectTabs, { stringValues: true })

      const root = screen.getByTestId('root')
      expect(root).toHaveAttribute('data-activation-direction', 'none')

      await user.click(screen.getByRole('button', { name: 'Add and Select' }))

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
      await waitFor(() => {
        expect(root).toHaveAttribute('data-activation-direction', 'right')
      })
      expect(screen.getByTestId('panel-Account')).toHaveAttribute(
        'data-activation-direction',
        'right'
      )
    })
  })
})
