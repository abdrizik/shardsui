import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicCombobox from './fixtures/basic-combobox.svelte'
import ComboboxItemPreventFixture from './fixtures/combobox-item-prevent-fixture.svelte'
import LinkItemsCombobox from './fixtures/link-items-combobox.svelte'
import MultipleCombobox from './fixtures/multiple-combobox.svelte'
import RootDisabledItem from './fixtures/root-disabled-item.svelte'
import UnregisteredItem from './fixtures/unregistered-item.svelte'
import VirtualizedMissingValueItem from './fixtures/virtualized-missing-value-item.svelte'
import VirtualizedNoIndex from './fixtures/virtualized-no-index.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Item />', () => {
  it('selects the item and closes in single mode', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(BasicCombobox, { onValueChange })
    const input = screen.getByRole('combobox') as HTMLInputElement

    await user.click(input)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    expect(input).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('option', { name: 'Apple' }))

    expect(onValueChange).toHaveBeenCalledOnce()
    expect(onValueChange.mock.calls[0][0]).toBe('apple')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    expect(input.value).toBe('apple')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not select a disabled item', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(BasicCombobox, { open: true, withDisabledItem: true, onValueChange })

    await user.click(screen.getByRole('option', { name: 'Cherry' }))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveValue('')
  })

  it('Enter selects the highlighted item and sets the input value', async () => {
    const user = userEvent.setup()
    render(BasicCombobox, {})
    const input = screen.getByRole('combobox') as HTMLInputElement

    await user.click(input)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    await waitFor(() => expect(input.value).toBe('apple'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('reflects the selected value with aria-selected when reopening', async () => {
    const user = userEvent.setup()
    render(BasicCombobox, {})
    const input = screen.getByRole('combobox')

    await user.click(input)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false')

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())

    await user.click(input)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
        'aria-selected',
        'false'
      )
    })
  })

  it('clears the selection when the input text is cleared in single mode', async () => {
    const user = userEvent.setup()
    render(BasicCombobox, {})
    const input = screen.getByRole('combobox') as HTMLInputElement

    await user.click(input)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    await user.click(screen.getByRole('option', { name: 'Apple' }))
    await waitFor(() => expect(input.value).toBe('apple'))

    await user.clear(input)
    expect(input.value).toBe('')

    await user.type(input, 'a')
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    for (const option of screen.getAllByRole('option')) {
      expect(option).not.toHaveAttribute('aria-selected', 'true')
    }
  })

  it('multiple mode toggles selection and stays open', async () => {
    const user = userEvent.setup()
    render(MultipleCombobox, {})

    await user.click(screen.getByRole('combobox'))
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    const apple = screen.getByRole('option', { name: 'Apple' })
    await user.click(apple)

    expect(apple).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(apple)
    expect(apple).not.toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('prevents default on mousedown so pointer selection does not steal input focus', () => {
    render(BasicCombobox, { open: true })

    const option = screen.getByRole('option', { name: 'Banana' })
    const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 })

    option.dispatchEvent(mouseDown)
    expect(mouseDown.defaultPrevented).toBe(true)
  })

  it.skipIf(isJSDOM)('keeps the input focused after selecting an item with touch', async () => {
    const user = userEvent.setup()
    render(BasicCombobox, { open: true })

    const input = screen.getByTestId('input')
    await user.click(input)
    expect(input).toHaveFocus()

    const option = screen.getByRole('option', { name: 'Banana' })

    await user.pointer([
      { target: option, keys: '[TouchA>]', pointerName: 'touch' },
      { target: option, keys: '[/TouchA]', pointerName: 'touch' }
    ])

    await waitFor(() => expect(input).toHaveValue('banana'))
    expect(input).toHaveFocus()
  })

  it('calls onmouseup and onpointerleave alongside the internal handlers', async () => {
    const handleMouseUp = vi.fn()
    const handlePointerLeave = vi.fn()
    render(ComboboxItemPreventFixture, {
      open: true,
      onItemMouseUp: handleMouseUp,
      onItemPointerLeave: handlePointerLeave
    })

    const option = screen.getByRole('option', { name: 'one' })
    await fireEvent.mouseUp(option)
    await fireEvent.pointerLeave(option)

    expect(handleMouseUp.mock.calls.length).toBe(1)
    expect(handlePointerLeave.mock.calls.length).toBe(1)
  })

  describe('prop: onClick', () => {
    it('calls onClick when clicked with a pointer', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(ComboboxItemPreventFixture, { open: true, onItemClick: handleClick })

      await user.click(screen.getByRole('option', { name: 'one' }))

      expect(handleClick.mock.calls.length).toBe(1)
    })

    it('calls onClick when selected with the Enter key', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(ComboboxItemPreventFixture, { open: true, onItemClick: handleClick })

      screen.getByTestId('input').focus()
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(handleClick.mock.calls.length).toBe(1)
    })

    it('does not select the item when onClick prevents the ShardsUI handler', async () => {
      const handleClick = vi.fn((event) => {
        event.preventShardsUIHandler()
      })
      const user = userEvent.setup()
      render(ComboboxItemPreventFixture, { onItemClick: handleClick })

      await user.click(screen.getByRole('option', { name: 'one' }))

      expect(handleClick).toHaveBeenCalledOnce()
      expect(screen.getByTestId('input')).toHaveValue('')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe.skipIf(!isJSDOM)('link handling', () => {
    it('does not select and keeps the popup open when the link has a non-hash href', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(LinkItemsCombobox, { onValueChange })

      await user.click(screen.getByTestId('link-href'))

      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.queryByRole('listbox')).not.toBeNull()
    })

    it('does not select and closes the popup when the link has a hash href', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(LinkItemsCombobox, { onValueChange })

      await user.click(screen.getByTestId('link-hash'))

      expect(onValueChange).not.toHaveBeenCalled()
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })

    it('selects normally when the anchor has no href', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(LinkItemsCombobox, { onValueChange })

      await user.click(screen.getByTestId('link-nohref'))

      expect(onValueChange).toHaveBeenCalledWith('nohref')
    })
  })

  describe('virtualized without explicit index', () => {
    it('selects the highlighted filtered item with the keyboard after filtering', async () => {
      const user = userEvent.setup()
      render(VirtualizedNoIndex)
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.type(input, 'f')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'one' })).toBeNull())
      expect(screen.getByRole('option', { name: 'four' })).not.toBeNull()

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      await waitFor(() => expect(input).toHaveValue('four'))
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('selects the clicked filtered item after filtering', async () => {
      const user = userEvent.setup()
      render(VirtualizedNoIndex)
      const input = screen.getByTestId('input') as HTMLInputElement

      await user.click(input)
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.type(input, 'f')
      await waitFor(() => expect(screen.queryByRole('option', { name: 'one' })).toBeNull())

      await user.click(screen.getByRole('option', { name: 'five' }))

      await waitFor(() => expect(input).toHaveValue('five'))
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('does not register an item missing from the filtered values', async () => {
      const user = userEvent.setup()
      render(VirtualizedMissingValueItem)

      const input = screen.getByTestId('input')
      const item = await screen.findByRole('option', { name: 'missing value' })

      await user.hover(item)

      expect(input).not.toHaveAttribute('aria-activedescendant')
      expect(item).not.toHaveAttribute('data-highlighted')
      expect(item).not.toHaveAttribute('id')
    })
  })

  it('does not assign an id to an explicitly unregistered item', () => {
    render(UnregisteredItem)

    expect(screen.getByRole('option', { name: 'orphan' })).not.toHaveAttribute('id')
  })

  it('inherits the disabled state from the root', async () => {
    const user = userEvent.setup()
    const onitemclick = vi.fn()
    render(RootDisabledItem, { onitemclick })

    const item = screen.getByRole('option', { name: 'one' })
    expect(item).toHaveAttribute('data-disabled')

    await user.click(item)

    expect(onitemclick).not.toHaveBeenCalled()
    expect(screen.getByTestId('input')).toHaveValue('')
  })
})
