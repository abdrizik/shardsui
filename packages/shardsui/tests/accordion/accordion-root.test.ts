import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AsAccordion from './fixtures/as-accordion.svelte'
import BasicAccordion from './fixtures/basic-accordion.svelte'
import ControlledAccordion from './fixtures/controlled-accordion.svelte'
import CustomPanelIdAccordion from './fixtures/custom-panel-id-accordion.svelte'
import CustomValueAccordion from './fixtures/custom-value-accordion.svelte'
import DecliningAccordion from './fixtures/declining-accordion.svelte'
import DisabledCallbacksAccordion from './fixtures/disabled-callbacks-accordion.svelte'
import DynamicTriggerIdAccordion from './fixtures/dynamic-trigger-id-accordion.svelte'
import OnOpenChangeAccordion from './fixtures/on-open-change-accordion.svelte'
import OptionalPartsAccordion from './fixtures/optional-parts-accordion.svelte'

const PANEL_CONTENT_1 = 'Panel 1'
const PANEL_CONTENT_2 = 'Panel 2'

describe('<Accordion.Root />', () => {
  describe('prop: as', () => {
    it('renders a custom element', () => {
      render(AsAccordion, { rootAs: 'section' })

      expect(screen.getByTestId('root').tagName.toLowerCase()).toBe('section')
    })
  })

  describe('ARIA attributes', () => {
    it('renders correct ARIA attributes — trigger aria-controls points to panel id, panel aria-labelledby points to trigger id', async () => {
      const user = userEvent.setup()
      render(BasicAccordion, { value: [] })

      const [trigger1] = screen.getAllByRole('button')

      await user.click(trigger1)

      const panel = screen.getByText(PANEL_CONTENT_1).closest('[role="region"]') as HTMLElement

      expect(trigger1).toHaveAttribute('aria-controls')
      expect(panel).not.toBeNull()
      expect(panel.getAttribute('id')).toBe(trigger1.getAttribute('aria-controls'))
      expect(trigger1.getAttribute('id')).toBe(panel.getAttribute('aria-labelledby'))
    })

    it('references a manual panel id in trigger aria-controls', () => {
      render(CustomPanelIdAccordion)

      const trigger = screen.getByRole('button')
      const panel = screen.getByText('Panel contents 1')

      expect(trigger).toHaveAttribute('aria-controls', 'custom-panel-id')
      expect(panel).toHaveAttribute('id', 'custom-panel-id')
    })

    it('references manual trigger id in panel aria-labelledby', () => {
      render(DynamicTriggerIdAccordion, { initialTriggerId: 'custom-trigger-id' })

      const panel = screen.getByText('Panel contents 1')

      expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id')
    })

    it('updates panel labeling when a manual trigger id is added or changed', async () => {
      const user = userEvent.setup()
      render(DynamicTriggerIdAccordion)

      const trigger = screen.getByRole('button', { name: 'Trigger 1' })
      const panel = screen.getByText('Panel contents 1')

      expect(trigger).toHaveAttribute('id')
      expect(panel).toHaveAttribute('aria-labelledby', trigger.id)

      await user.click(screen.getByRole('button', { name: 'Set id 1' }))

      await waitFor(() => expect(trigger).toHaveAttribute('id', 'custom-trigger-id-1'))
      await waitFor(() => expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id-1'))

      await user.click(screen.getByRole('button', { name: 'Set id 2' }))

      await waitFor(() => expect(trigger).toHaveAttribute('id', 'custom-trigger-id-2'))
      await waitFor(() => expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id-2'))
    })

    it('restores panel labeling when a manual trigger id is removed', async () => {
      const user = userEvent.setup()
      render(DynamicTriggerIdAccordion, { initialTriggerId: 'custom-trigger-id' })

      const trigger = screen.getByRole('button', { name: 'Trigger 1' })
      const panel = screen.getByText('Panel contents 1')

      expect(panel).toHaveAttribute('aria-labelledby', 'custom-trigger-id')

      await user.click(screen.getByRole('button', { name: 'Remove id' }))

      await waitFor(() => expect(trigger).toHaveAttribute('id'))
      expect(trigger).not.toHaveAttribute('id', 'custom-trigger-id')
      await waitFor(() => expect(panel).toHaveAttribute('aria-labelledby', trigger.id))
    })

    it('unregisters generated part ids when the trigger or panel unmounts', async () => {
      const { rerender } = render(OptionalPartsAccordion, { parts: 'both' })

      await rerender({ parts: 'panel' })
      expect(screen.getByText('Panel contents 1')).not.toHaveAttribute('aria-labelledby')

      await rerender({ parts: 'both' })
      let trigger = screen.getByRole('button', { name: 'Trigger 1' })
      let panel = screen.getByText('Panel contents 1')
      expect(panel).toHaveAttribute('aria-labelledby', trigger.id)

      await rerender({ parts: 'trigger' })
      expect(screen.getByRole('button', { name: 'Trigger 1' })).not.toHaveAttribute('aria-controls')

      await rerender({ parts: 'both' })
      trigger = screen.getByRole('button', { name: 'Trigger 1' })
      panel = screen.getByText('Panel contents 1')
      expect(trigger).toHaveAttribute('aria-controls', panel.id)
    })
  })

  describe('uncontrolled initial value', () => {
    it('opens the item matching the initial value on mount', () => {
      render(CustomValueAccordion, { value: ['one'] })

      expect(screen.queryByText('Panel contents 1')).toBeInTheDocument()
      expect(screen.queryByText('Panel contents 1')).toHaveAttribute('data-open')
      expect(screen.queryByText('Panel contents 2')).toBeNull()
    })
  })

  describe.skipIf(isJSDOM)('open/close interaction', () => {
    it('clicking a trigger opens its panel with aria-expanded=true and data-open', async () => {
      const user = userEvent.setup()
      render(BasicAccordion, { value: [] })

      const [trigger1] = screen.getAllByRole('button')

      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()

      await user.click(trigger1)

      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(trigger1).toHaveAttribute('data-panel-open')
      expect(screen.getByText(PANEL_CONTENT_1)).toBeInTheDocument()
      expect(screen.getByText(PANEL_CONTENT_1)).toBeVisible()
      expect(screen.getByText(PANEL_CONTENT_1)).toHaveAttribute('data-open')
    })

    it('clicking an open trigger closes its panel', async () => {
      const user = userEvent.setup()
      render(BasicAccordion, { value: [] })

      const [trigger1] = screen.getAllByRole('button')

      await user.click(trigger1)
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')

      await user.click(trigger1)

      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(trigger1).not.toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()
    })
  })

  describe.skipIf(isJSDOM)('prop: multiple', () => {
    it('multiple items can be open when multiple=true', async () => {
      const user = userEvent.setup()
      render(BasicAccordion, { value: [], multiple: true })

      const [trigger1, trigger2] = screen.getAllByRole('button')

      expect(trigger1).not.toHaveAttribute('data-panel-open')
      expect(trigger2).not.toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()
      expect(screen.queryByText(PANEL_CONTENT_2)).toBeNull()

      await user.click(trigger1)
      await user.click(trigger2)

      expect(screen.getByText(PANEL_CONTENT_1)).toHaveAttribute('data-open')
      expect(screen.getByText(PANEL_CONTENT_2)).toHaveAttribute('data-open')
      expect(trigger1).toHaveAttribute('data-panel-open')
      expect(trigger2).toHaveAttribute('data-panel-open')

      await user.click(trigger1)

      expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()
      expect(screen.getByText(PANEL_CONTENT_2)).toHaveAttribute('data-open')
      expect(trigger1).not.toHaveAttribute('data-panel-open')
      expect(trigger2).toHaveAttribute('data-panel-open')
    })

    it('when multiple=false only one item can be open', async () => {
      const user = userEvent.setup()
      render(BasicAccordion, { value: [], multiple: false })

      const [trigger1, trigger2] = screen.getAllByRole('button')

      await user.click(trigger1)
      expect(screen.getByText(PANEL_CONTENT_1)).toHaveAttribute('data-open')
      expect(trigger1).toHaveAttribute('data-panel-open')

      await user.click(trigger2)
      expect(screen.getByText(PANEL_CONTENT_2)).toHaveAttribute('data-open')
      expect(trigger2).toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()
      expect(trigger1).not.toHaveAttribute('data-panel-open')
    })
  })

  describe('prop: disabled', () => {
    it('can disable the whole accordion — item/header/trigger/panel all get data-disabled', () => {
      render(BasicAccordion, { value: [], keepMounted: true, disabled: true })

      const [header1, header2] = screen.getAllByRole('heading')
      const [trigger1, trigger2] = screen.getAllByRole('button')

      for (const el of [
        screen.getByTestId('item1'),
        header1,
        trigger1,
        screen.getByText(PANEL_CONTENT_1),
        screen.getByTestId('item2'),
        header2,
        trigger2,
        screen.getByText(PANEL_CONTENT_2)
      ]) {
        expect(el).toHaveAttribute('data-disabled')
      }
    })

    it('can disable one accordion item — only item1/header1/trigger1/panel1 get data-disabled', () => {
      render(BasicAccordion, { value: [], keepMounted: true, itemDisabled: true })

      const [header1, header2] = screen.getAllByRole('heading')
      const [trigger1, trigger2] = screen.getAllByRole('button')

      for (const el of [
        screen.getByTestId('item1'),
        header1,
        trigger1,
        screen.getByText(PANEL_CONTENT_1)
      ]) {
        expect(el).toHaveAttribute('data-disabled')
      }
      for (const el of [
        screen.getByTestId('item2'),
        header2,
        trigger2,
        screen.getByText(PANEL_CONTENT_2)
      ]) {
        expect(el).not.toHaveAttribute('data-disabled')
      }
    })

    it.each(['root', 'item'] as const)(
      'does not toggle or fire callbacks when the %s is disabled',
      async (disabledPart) => {
        const user = userEvent.setup()
        const onValueChange = vi.fn()
        const onOpenChange = vi.fn()
        const onclick = vi.fn()
        render(DisabledCallbacksAccordion, { disabledPart, onValueChange, onOpenChange, onclick })

        const [trigger1] = screen.getAllByRole('button')

        await user.pointer({ keys: '[MouseLeft]', target: trigger1 })
        trigger1.focus()
        await user.keyboard('[Space]')
        await user.keyboard('[Enter]')

        expect(trigger1).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()
        expect(onValueChange.mock.calls.length).toBe(0)
        expect(onOpenChange.mock.calls.length).toBe(0)
        expect(onclick.mock.calls.length).toBe(0)
      }
    )

    it('forwards the trigger onclick alongside the toggle when enabled', async () => {
      const user = userEvent.setup()
      const onclick = vi.fn()
      const onValueChange = vi.fn()
      render(DisabledCallbacksAccordion, { disabledPart: 'item', onValueChange, onclick })

      const [, trigger2] = screen.getAllByRole('button')

      await user.click(trigger2)

      expect(onclick.mock.calls.length).toBe(1)
      expect(trigger2).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe.skipIf(isJSDOM)('keyboard interactions', () => {
    it('Enter key toggles the panel open and closed', async () => {
      const user = userEvent.setup()
      render(BasicAccordion, { value: [] })

      const [trigger1] = screen.getAllByRole('button')

      await user.keyboard('{Tab}')
      expect(trigger1).toHaveFocus()

      await user.keyboard('{Enter}')

      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(trigger1).toHaveAttribute('data-panel-open')
      expect(screen.getByText(PANEL_CONTENT_1)).toBeInTheDocument()
      expect(screen.getByText(PANEL_CONTENT_1)).toHaveAttribute('data-open')

      await user.keyboard('{Enter}')

      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()
    })

    it('Space key toggles the panel open and closed', async () => {
      const user = userEvent.setup()
      render(BasicAccordion, { value: [] })

      const [trigger1] = screen.getAllByRole('button')

      await user.keyboard('{Tab}')
      expect(trigger1).toHaveFocus()

      await user.keyboard('{ }')

      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(trigger1).toHaveAttribute('data-panel-open')
      expect(screen.getByText(PANEL_CONTENT_1)).toBeInTheDocument()

      await user.keyboard('{ }')

      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBeNull()
    })

    it.each(['Enter', 'Space'])(
      'key: %s toggles the panel when rendering a non-interactive trigger',
      async (key) => {
        const user = userEvent.setup()
        render(OnOpenChangeAccordion, { as: 'span' })

        const trigger = screen.getByRole('button')

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText('Panel contents 1')).toBeNull()

        await user.keyboard('[Tab]')
        expect(trigger).toHaveFocus()

        await user.keyboard(`[${key}]`)

        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(trigger).toHaveAttribute('data-panel-open')
        expect(screen.getByText('Panel contents 1')).toBeInTheDocument()
        expect(screen.getByText('Panel contents 1')).toHaveAttribute('data-open')

        await user.keyboard(`[${key}]`)

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText('Panel contents 1')).toBeNull()
      }
    )
  })

  describe('keyboard activation timing', () => {
    it.each(['button', 'span'] as const)(
      'opens and closes on Space keyup when rendering an %s trigger',
      async (as) => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        render(OnOpenChangeAccordion, { onOpenChange, as })

        const trigger = screen.getByRole('button')

        await user.keyboard('{Tab}')
        expect(trigger).toHaveFocus()

        await user.keyboard('[Space>]')
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText('Panel contents 1')).toBeNull()
        expect(onOpenChange).not.toHaveBeenCalled()

        await user.keyboard('[/Space]')
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByText('Panel contents 1')).not.toBeNull()
        expect(onOpenChange).toHaveBeenCalledTimes(1)
        expect(onOpenChange.mock.calls[0][0]).toBe(true)

        await user.keyboard('[Space>]')
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByText('Panel contents 1')).not.toBeNull()
        expect(onOpenChange).toHaveBeenCalledTimes(1)

        await user.keyboard('[/Space]')
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText('Panel contents 1')).toBeNull()
        expect(onOpenChange).toHaveBeenCalledTimes(2)
        expect(onOpenChange.mock.calls[1][0]).toBe(false)
      }
    )
  })

  describe.skipIf(isJSDOM)('prop: onValueChange', () => {
    it('calls onValueChange with the new value array when a panel opens', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(BasicAccordion, { onValueChange })

      const [trigger1] = screen.getAllByRole('button')

      expect(onValueChange).not.toHaveBeenCalled()

      await user.click(trigger1)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      const [valueArg] = onValueChange.mock.calls[0]
      expect(Array.isArray(valueArg)).toBe(true)
      expect(valueArg).toHaveLength(1)
    })

    it('multiple: accumulates numeric item values across presses', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(CustomValueAccordion, { multiple: true, itemValues: [0, 1], onValueChange })

      const [trigger1, trigger2] = screen.getAllByRole('button')

      expect(onValueChange).not.toHaveBeenCalled()

      await user.pointer({ keys: '[MouseLeft]', target: trigger1 })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toEqual([0])

      trigger2.focus()
      await user.keyboard('[Space]')

      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[1][0]).toEqual([0, 1])
    })

    it('multiple: accumulates custom item values across presses', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(CustomValueAccordion, { multiple: true, onValueChange })

      const [trigger1, trigger2] = screen.getAllByRole('button')

      expect(onValueChange).not.toHaveBeenCalled()

      await user.click(trigger2)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toEqual(['two'])

      await user.click(trigger1)

      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[1][0]).toEqual(['two', 'one'])
    })

    it('when multiple=false it replaces the value with the newly opened item', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(CustomValueAccordion, { multiple: false, onValueChange })

      const [trigger1, trigger2] = screen.getAllByRole('button')

      expect(onValueChange).not.toHaveBeenCalled()

      await user.click(trigger1)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toEqual(['one'])

      await user.click(trigger2)

      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[1][0]).toEqual(['two'])
    })
  })

  describe('declined value changes', () => {
    it('does not open an item when the value setter rejects the change', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(DecliningAccordion, { allowChange: false, onValueChange })

      const [trigger1] = screen.getAllByRole('button')
      await user.click(trigger1)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBe(null)
    })

    it('does not close an open item when the value setter rejects the change', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(DecliningAccordion, { value: ['one'], allowChange: false, onValueChange })

      const [trigger1] = screen.getAllByRole('button')
      await user.click(trigger1)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText(PANEL_CONTENT_1)).toBeInTheDocument()
    })

    it('multiple: does not open a second item when the value setter rejects the change', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(DecliningAccordion, {
        multiple: true,
        value: ['one'],
        allowChange: false,
        onValueChange
      })

      const [, trigger2] = screen.getAllByRole('button')
      await user.click(trigger2)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(trigger2).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT_2)).toBe(null)
    })

    it('multiple: does not close an open item when the value setter rejects the change', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(DecliningAccordion, {
        multiple: true,
        value: ['one', 'two'],
        allowChange: false,
        onValueChange
      })

      const [trigger1] = screen.getAllByRole('button')
      await user.click(trigger1)

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText(PANEL_CONTENT_1)).toBeInTheDocument()
    })
  })

  describe.skipIf(isJSDOM)('controlled value', () => {
    it('open state — updating the value prop after mount opens/closes the panel', async () => {
      const { rerender } = render(ControlledAccordion, { value: [] })

      const trigger = screen.getByRole('button')

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT_1)).toBe(null)

      await rerender({ value: [0] })

      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
      expect(trigger).toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT_1)).not.toBe(null)
      expect(screen.queryByText(PANEL_CONTENT_1)).toHaveAttribute('data-open')

      await rerender({ value: [] })

      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
      expect(screen.queryByText(PANEL_CONTENT_1)).toBe(null)
    })
  })
})
