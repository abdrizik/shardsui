import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicSelect from './fixtures/basic-select.svelte'
import GroupedReorderSelect from './fixtures/grouped-reorder-select.svelte'
import MultipleSelect from './fixtures/multiple-select.svelte'
import QuickSelection from './fixtures/quick-selection.svelte'
import RootDisabledItem from './fixtures/root-disabled-item.svelte'
import SelectValueDisplay from './fixtures/select-value-display.svelte'
import SelectVirtualClick from './fixtures/select-virtual-click.svelte'
import SelectWithDisabledItem from './fixtures/select-with-disabled-item.svelte'

describe('<Select.Item />', () => {
  it('treats a null value as an empty selection in multiple mode', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(MultipleSelect, { value: null, onValueChange })

    await user.click(screen.getByTestId('trigger'))

    const option = await screen.findByRole('option', { name: 'Option A' })
    expect(option).toHaveAttribute('aria-selected', 'false')

    await user.pointer({ target: option })
    await user.click(option)

    expect(onValueChange).toHaveBeenCalledWith(['a'])
  })

  it('keeps the selection while grouped items are reordered and inserted', async () => {
    const user = userEvent.setup()
    render(GroupedReorderSelect)

    await user.click(screen.getByTestId('prepend'))
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'a' })).not.toBe(null)
    })

    await user.click(screen.getByTestId('reverse'))
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('data-selected')
    })

    await user.click(screen.getByTestId('reverse'))
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('data-selected')
    })
  })

  it('calls onValueChange exactly once for a regular click', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(BasicSelect, { onValueChange })

    await user.click(screen.getByRole('combobox'))
    const optionA = screen.getByRole('option', { name: 'Option A' })
    await user.pointer({ target: optionA })
    await user.click(optionA)

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('does not select a disabled item', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(SelectWithDisabledItem, { onValueChange })

    await user.click(screen.getByRole('combobox'))
    const disabledItem = screen.getByRole('option', { name: 'Option B (disabled)' })
    await user.click(disabledItem)

    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  describe('style hooks', () => {
    it('applies data-highlighted to the highlighted item', async () => {
      const user = userEvent.setup()
      render(BasicSelect)

      await user.click(screen.getByRole('combobox'))

      const options = screen.getAllByRole('option')
      await waitFor(() => {
        expect(options[0]).toHaveAttribute('data-highlighted')
      })

      await fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })

      await waitFor(() => {
        expect(options[1]).toHaveAttribute('data-highlighted')
        expect(options[0]).not.toHaveAttribute('data-highlighted')
      })
    })

    it('applies data-selected to the selected item', async () => {
      const user = userEvent.setup()
      render(BasicSelect)

      await user.click(screen.getByRole('combobox'))
      const optionB = screen.getByRole('option', { name: 'Option B' })
      await user.pointer({ target: optionB })
      await user.click(optionB)

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

      await user.click(screen.getByRole('combobox'))

      expect(screen.getByRole('option', { name: 'Option B' })).toHaveAttribute('data-selected')
      expect(screen.getByRole('option', { name: 'Option A' })).not.toHaveAttribute('data-selected')
    })
  })

  it('focuses disabled items', async () => {
    render(SelectWithDisabledItem)
    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox'))

    const disabledItem = screen.getByRole('option', { name: 'Option B (disabled)' })
    disabledItem.focus()

    expect(disabledItem).toHaveFocus()
  })

  it('selects an unhighlighted item with the mouse', async () => {
    render(SelectVirtualClick, { open: true })

    const option = screen.getByRole('option', { name: 'two' })
    expect(option).not.toHaveAttribute('data-highlighted')

    await fireEvent.pointerDown(option, { pointerType: 'mouse' })
    await fireEvent.mouseDown(option)
    await fireEvent.mouseUp(option)
    await fireEvent.click(option, { detail: 1 })

    await waitFor(() => {
      expect(screen.getByTestId('value').textContent).toBe('two')
    })
  })

  it('highlights a hovered item and commits it with a mouse click', async () => {
    const onValueChange = vi.fn()
    render(QuickSelection, { onValueChange })

    const trigger = screen.getByTestId('trigger')
    fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    fireEvent.mouseDown(trigger)
    fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
    fireEvent.mouseUp(trigger)
    fireEvent.click(trigger, { detail: 1 })

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBe(null)
    })

    const option = screen.getByRole('option', { name: 'two' })

    fireEvent.pointerEnter(option, { pointerType: 'mouse' })
    fireEvent.mouseMove(option)

    await waitFor(() => {
      expect(option).toHaveAttribute('data-highlighted')
    })

    fireEvent.pointerDown(option, { pointerType: 'mouse' })
    fireEvent.mouseDown(option)
    fireEvent.pointerUp(option, { pointerType: 'mouse' })
    fireEvent.mouseUp(option)
    fireEvent.click(option, { detail: 1 })

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('two')
    await waitFor(() => {
      expect(screen.getByTestId('value').textContent).toBe('two')
    })
  })

  it.skipIf(!isJSDOM)('navigating with the keyboard focuses the item', async () => {
    const user = userEvent.setup()
    render(BasicSelect)

    await user.click(screen.getByRole('combobox'))

    await waitFor(() => {
      expect(screen.getByRole('listbox')).not.toBe(null)
    })
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Option A' })).toHaveFocus()
    })

    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Option B' })).toHaveFocus()
    })

    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Option C' })).toHaveFocus()
    })
  })

  it('focuses the selected item upon opening the popup', async () => {
    const user = userEvent.setup()
    render(SelectValueDisplay, { value: null })

    const trigger = screen.getByTestId('trigger')
    await user.click(trigger)
    const three = screen.getByRole('option', { name: 'three' })
    await user.pointer({ target: three })
    await user.click(three)
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'three' })).toHaveFocus()
    })
  })

  describe.skipIf(!isJSDOM)('quick selection', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    const wait = (ms: number) => vi.advanceTimersByTimeAsync(ms)

    async function openByHoldingTheTrigger() {
      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBe(null))
    }

    function dragOver(option: HTMLElement) {
      fireEvent.pointerEnter(option, { pointerType: 'mouse' })
      fireEvent.pointerMove(option, { pointerType: 'mouse', buttons: 1, movementY: 8 })
    }

    it('does not select an item on quick mouseup when showing a placeholder', async () => {
      render(QuickSelection)

      const value = screen.getByTestId('value')
      expect(value.textContent).toBe('Select font')

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'one' })
      fireEvent.mouseMove(option)

      await wait(250)
      fireEvent.mouseUp(option)

      await waitFor(() => expect(value.textContent).toBe('Select font'))
    })

    it('calls onClick when selecting via drag-to-select', async () => {
      const onItemOneClick = vi.fn()
      render(QuickSelection, { onItemOneClick })

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'one' })
      dragOver(option)

      await wait(500)
      fireEvent.mouseUp(option)

      await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('one'))
      expect(onItemOneClick).toHaveBeenCalledTimes(1)
    })

    it('does not fire click handlers on a disabled item during drag-to-select', async () => {
      const onItemOneClick = vi.fn()
      render(QuickSelection, { oneDisabled: true, onItemOneClick })

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'one' })
      dragOver(option)

      await wait(100)
      fireEvent.mouseUp(option)

      expect(onItemOneClick).not.toHaveBeenCalled()
    })

    it('does not select a disabled item via drag-to-select', async () => {
      const onValueChange = vi.fn()
      render(QuickSelection, { oneDisabled: true, onValueChange })

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'one' })
      dragOver(option)

      await wait(100)
      fireEvent.mouseUp(option)

      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.getByTestId('value').textContent).toBe('Select font')
    })

    it('does not select on mouseup that follows a touch interaction', async () => {
      const onValueChange = vi.fn()
      render(QuickSelection, { onValueChange })

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'one' })
      fireEvent.pointerEnter(option, { pointerType: 'touch' })

      await wait(500)
      fireEvent.mouseUp(option)

      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.getByTestId('value').textContent).toBe('Select font')
    })

    it('selects via drag-to-select when hover highlighting is disabled', async () => {
      render(QuickSelection, { highlightItemOnHover: false })

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'two' })
      dragOver(option)

      expect(option).not.toHaveAttribute('data-highlighted')

      await wait(500)
      fireEvent.mouseUp(option)

      await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('two'))
    })

    it('does not select an item when onClick cancels during drag-to-select', async () => {
      const onItemOneClick = vi.fn((event: MouseEvent & { preventShardsUIHandler?: () => void }) =>
        event.preventShardsUIHandler?.()
      )
      render(QuickSelection, { onItemOneClick })

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'one' })
      dragOver(option)

      await wait(500)
      fireEvent.mouseUp(option)

      expect(onItemOneClick).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('value').textContent).toBe('Select font')
      expect(screen.queryByRole('listbox')).not.toBe(null)
    })

    it('accumulates drag-to-select movement across items', async () => {
      render(QuickSelection)

      await openByHoldingTheTrigger()

      const one = screen.getByRole('option', { name: 'one' })
      fireEvent.pointerEnter(one, { pointerType: 'mouse' })
      fireEvent.pointerMove(one, { pointerType: 'mouse', buttons: 1, movementY: 4 })

      const two = screen.getByRole('option', { name: 'two' })
      fireEvent.pointerEnter(two, { pointerType: 'mouse' })
      fireEvent.pointerMove(two, { pointerType: 'mouse', buttons: 1, movementY: 4 })

      await wait(100)
      fireEvent.mouseUp(two)

      await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('two'))
    })

    it('does not treat small pointer movement as drag-to-select', async () => {
      render(QuickSelection)

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'two' })
      fireEvent.pointerEnter(option, { pointerType: 'mouse' })
      fireEvent.pointerMove(option, { pointerType: 'mouse', buttons: 1, movementY: 2 })

      await wait(100)
      fireEvent.mouseUp(option)

      expect(screen.getByTestId('value').textContent).toBe('Select font')
    })

    it('allows small pointer movement to select after the opening delay', async () => {
      render(QuickSelection)

      await openByHoldingTheTrigger()

      const option = screen.getByRole('option', { name: 'two' })
      fireEvent.pointerEnter(option, { pointerType: 'mouse' })
      fireEvent.pointerMove(option, { pointerType: 'mouse', buttons: 1, movementY: 2 })

      await wait(500)
      fireEvent.mouseUp(option)

      await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('two'))
    })

    it('ignores an opening click that did not start on the item', async () => {
      render(QuickSelection, { highlightItemOnHover: false })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBe(null))

      const option = screen.getByRole('option', { name: 'one' })
      fireEvent.mouseUp(option)
      fireEvent.click(option, { detail: 1 })

      expect(screen.getByTestId('value').textContent).toBe('Select font')
    })
  })

  it('ignores an unhighlighted item with a generic virtual click', async () => {
    render(SelectVirtualClick, { open: true })

    const option = screen.getByRole('option', { name: 'two' })
    expect(option).not.toHaveAttribute('data-highlighted')

    await fireEvent.click(option, { detail: 0 })

    expect(screen.getByTestId('value').textContent).toBe('')
  })

  it('inherits the disabled state from the root', async () => {
    const user = userEvent.setup()
    const onitemclick = vi.fn()
    render(RootDisabledItem, { onitemclick })

    const item = screen.getByRole('option', { name: 'one' })
    expect(item).toHaveAttribute('data-disabled')

    await user.click(item)

    expect(onitemclick).not.toHaveBeenCalled()
    expect(screen.getByTestId('value')).toHaveTextContent('')
  })
})
