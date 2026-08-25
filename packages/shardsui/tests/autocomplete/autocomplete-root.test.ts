import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AlwaysHighlightListAutocomplete from './fixtures/always-highlight-list-autocomplete.svelte'
import AutoHighlightItems from './fixtures/auto-highlight-items.svelte'
import AutocompleteInField from './fixtures/autocomplete-in-field.svelte'
import AutocompleteInForm from './fixtures/autocomplete-in-form.svelte'
import AutocompleteInputProps from './fixtures/autocomplete-input-props.svelte'
import AutocompleteWithGroupTrigger from './fixtures/autocomplete-with-group-trigger.svelte'
import AutofillAutocomplete from './fixtures/autofill-autocomplete.svelte'
import BasicAutocomplete from './fixtures/basic-autocomplete.svelte'
import ControlledValueAutocomplete from './fixtures/controlled-value-autocomplete.svelte'
import ErrorsForm from './fixtures/errors-form.svelte'
import ExternalForm from './fixtures/external-form.svelte'
import FieldPopupInputAutocomplete from './fixtures/field-popup-input-autocomplete.svelte'
import InlineAlwaysAutocomplete from './fixtures/inline-always-autocomplete.svelte'
import InlineForm from './fixtures/inline-form.svelte'
import InlineListAutocomplete from './fixtures/inline-list-autocomplete.svelte'
import InlineModeAutocomplete from './fixtures/inline-mode-autocomplete.svelte'
import InputInPopupAutocomplete from './fixtures/input-in-popup-autocomplete.svelte'
import InputInPopupForm from './fixtures/input-in-popup-form.svelte'
import ItemClickSubmitAutocomplete from './fixtures/item-click-submit-autocomplete.svelte'
import ItemsAutocomplete from './fixtures/items-autocomplete.svelte'
import KeepHighlightAutocomplete from './fixtures/keep-highlight-autocomplete.svelte'
import NullValueAutocomplete from './fixtures/null-value-autocomplete.svelte'
import RequiredForm from './fixtures/required-form.svelte'
import ScrollListAutocomplete from './fixtures/scroll-list-autocomplete.svelte'
import SubmitForm from './fixtures/submit-form.svelte'
import UnscopedForm from './fixtures/unscoped-form.svelte'
import ValidationModeForm from './fixtures/validation-mode-form.svelte'

describe('<Autocomplete.Root />', () => {
  describe('keyboard interactions', () => {
    it('closes popup on Tab after selecting with Enter and typing again', async () => {
      const user = userEvent.setup()
      const { container } = render(BasicAutocomplete, { autoHighlight: true })

      const btn = document.createElement('button')
      btn.textContent = 'outside'
      container.appendChild(btn)

      const input = screen.getByRole<HTMLInputElement>('combobox')
      await user.click(input)
      await user.type(input, 'ban')

      const banana = await screen.findByRole('option', { name: 'Banana' })
      await waitFor(() => {
        expect(banana).toHaveAttribute('data-highlighted')
      })

      await user.keyboard('{Enter}')
      expect(input.value).toBe('Banana')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull()
      })

      await user.clear(input)
      await user.type(input, 'a')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      await user.tab()

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull()
      })
    })
  })

  describe('input inside popup composition', () => {
    it('commits a keyboard selection, restores trigger focus, and preserves it on reopen', async () => {
      const user = userEvent.setup()
      render(InputInPopupAutocomplete, { autoHighlight: true })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      const input = await screen.findByTestId('input')
      await waitFor(() => expect(input).toHaveFocus())
      await user.type(input, 'al')

      const alpha = screen.getByRole('option', { name: 'alpha' })
      await waitFor(() => expect(alpha).toHaveAttribute('data-highlighted'))
      await user.keyboard('{Enter}')

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(trigger).toHaveFocus()
      expect(trigger).toHaveTextContent('alpha')

      await user.click(trigger)

      expect(await screen.findByTestId('input')).toHaveValue('alpha')
      expect(await screen.findByRole('option', { name: 'alpha' })).not.toBeNull()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    })

    it('preserves the typed value when the popup is dismissed with Escape', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(InputInPopupAutocomplete, { onValueChange })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)

      const input = await screen.findByTestId('input')
      await waitFor(() => expect(input).toHaveFocus())
      await user.type(input, 'al')
      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(trigger).toHaveFocus()
      expect(trigger).toHaveTextContent('al')
      expect(onValueChange.mock.lastCall?.[0]).toBe('al')

      await user.click(trigger)

      expect(await screen.findByTestId('input')).toHaveValue('al')
      expect(await screen.findByRole('option', { name: 'alpha' })).not.toBeNull()
      expect(await screen.findByRole('option', { name: 'alpine' })).not.toBeNull()
      await waitFor(() => expect(screen.queryByRole('option', { name: 'beta' })).toBeNull())

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    })
  })

  it('should handle browser autofill', async () => {
    render(AutofillAutocomplete)

    const hidden = screen.getByRole('textbox', { hidden: true })
    fireEvent.change(hidden, { target: { value: 'beta' } })

    const input = screen.getByTestId<HTMLInputElement>('input')
    await waitFor(() => {
      expect(input.value).toBe('beta')
    })
  })

  it('ignores hidden-input autofill when readOnly', async () => {
    const onValueChange = vi.fn()
    render(AutofillAutocomplete, { readOnly: true, onValueChange })

    const hidden = screen.getByRole('textbox', { hidden: true })
    fireEvent.change(hidden, { target: { value: 'beta' } })

    const input = screen.getByTestId<HTMLInputElement>('input')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input.value).toBe('')
  })

  it('ignores hidden-input autofill when disabled', async () => {
    const onValueChange = vi.fn()
    render(AutofillAutocomplete, { disabled: true, onValueChange })

    const hidden = screen.getByRole('textbox', { hidden: true })
    fireEvent.change(hidden, { target: { value: 'beta' } })

    const input = screen.getByTestId<HTMLInputElement>('input')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input.value).toBe('')
  })

  it('should pass autocomplete to the visible input', async () => {
    render(AutocompleteInputProps, { name: 'search', autocomplete: 'on' })

    const input = screen.getByRole('combobox')
    const hiddenInput = screen.getByRole('textbox', { hidden: true })

    expect(input).toHaveAttribute('name', 'search')
    expect(input).toHaveAttribute('autocomplete', 'on')
    expect(hiddenInput).not.toHaveAttribute('name')
    expect(hiddenInput).toHaveAttribute('id')
    expect(hiddenInput).not.toHaveAttribute('autocomplete')
  })

  it('does not expose data-placeholder on Trigger or InputGroup', async () => {
    const user = userEvent.setup()
    render(AutocompleteWithGroupTrigger)

    const group = screen.getByTestId('group')
    const input = screen.getByTestId('input')
    const trigger = screen.getByTestId('trigger')

    expect(group).not.toHaveAttribute('data-placeholder')
    expect(trigger).not.toHaveAttribute('data-placeholder')

    await user.type(input, 'al')

    expect(group).not.toHaveAttribute('data-placeholder')
    expect(trigger).not.toHaveAttribute('data-placeholder')
  })

  describe('prop: autoHighlight', () => {
    it('calls onItemHighlighted when the popup auto highlights on open', async () => {
      const onItemHighlighted = vi.fn()
      const user = userEvent.setup()
      render(AutoHighlightItems, {
        items: ['alpha', 'alpine', 'beta'],
        autoHighlight: true,
        onItemHighlighted
      })

      const input = screen.getByTestId<HTMLInputElement>('input')
      await user.type(input, 'a')

      const firstOption = await screen.findByRole('option', { name: 'alpha' })
      expect(onItemHighlighted.mock.calls.length).toBeGreaterThan(0)

      const [value, reason] = onItemHighlighted.mock.lastCall ?? []
      expect(value).toBe('alpha')
      expect(reason).toBe('none')

      await waitFor(() => {
        expect(firstOption).toHaveAttribute('data-highlighted')
      })
    })

    it('highlights the first item when typing and keeps it during filtering', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, {
        items: ['new york', 'new york city', 'newcastle'],
        autoHighlight: true
      })

      const input = screen.getByRole<HTMLInputElement>('combobox')
      await user.click(input)
      await user.type(input, 'new')

      const newYork = screen.getByRole('option', { name: 'new york' })
      await waitFor(() => {
        expect(newYork).toHaveAttribute('data-highlighted')
      })
      expect(input.getAttribute('aria-activedescendant')).toBe(newYork.id)

      await user.type(input, ' ')

      expect(newYork).toHaveAttribute('data-highlighted')
      expect(input.getAttribute('aria-activedescendant')).toBe(newYork.id)
    })

    it('does not highlight on open via click or when pressing arrow keys initially', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, {
        items: ['apple', 'banana'],
        autoHighlight: true,
        openOnInputClick: true
      })

      const input = screen.getByRole<HTMLInputElement>('combobox')
      fireEvent.click(input)

      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-activedescendant')
      })

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-activedescendant')
      })

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-activedescendant')
      })

      await user.keyboard('{Escape}')
      await user.click(input)

      expect(input).not.toHaveAttribute('aria-activedescendant')

      await user.keyboard('{ArrowUp}')
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant')
      })
    })

    it('highlights the first item when opening via ArrowDown', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, { items: ['alpha', 'beta', 'gamma'], autoHighlight: true })

      const input = screen.getByRole<HTMLInputElement>('combobox')

      await user.click(input)
      await user.keyboard('{ArrowDown}')

      const firstOption = await screen.findByRole('option', { name: 'alpha' })
      expect(firstOption).toHaveAttribute('data-highlighted')
      expect(input.getAttribute('aria-activedescendant')).toBe(firstOption.id)
    })

    it('links aria-activedescendant to the highlighted item after filtering', async () => {
      const user = userEvent.setup()
      render(BasicAutocomplete, { autoHighlight: true })

      const input = screen.getByRole<HTMLInputElement>('combobox')
      await user.click(input)
      await user.type(input, 'a')

      await waitFor(() => {
        const highlighted = document.querySelector('[data-highlighted]')
        expect(highlighted).not.toBeNull()
        expect(input.getAttribute('aria-activedescendant')).toBe(highlighted!.id)
      })

      await user.type(input, 'pp')

      await waitFor(() => {
        const apple = screen.getByRole('option', { name: 'Apple' })
        expect(apple).toHaveAttribute('data-highlighted')
        expect(input.getAttribute('aria-activedescendant')).toBe(apple.id)
      })
    })

    it('does not highlight first/last item when pressing ArrowDown/ArrowUp initially', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, { items: ['alpha', 'beta', 'gamma'] })

      const input = screen.getByTestId<HTMLInputElement>('input')

      await user.click(input)
      expect(input).not.toHaveAttribute('aria-activedescendant')

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-activedescendant')
      })

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant')
      })
    })

    it('retains highlight when clearing the query with autoHighlight enabled', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, {
        items: ['apple', 'banana', 'cherry'],
        autoHighlight: true,
        openOnInputClick: true
      })

      const input = screen.getByRole<HTMLInputElement>('combobox')

      await user.click(input)
      await user.type(input, 'ban')

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())
      await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))

      const highlightedBefore = input.getAttribute('aria-activedescendant')

      await user.clear(input)

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())
      expect(input.getAttribute('aria-activedescendant')).toBe(highlightedBefore)
    })

    it('highlights the first item immediately when behavior is "always"', async () => {
      render(AutoHighlightItems, {
        items: ['alpha', 'beta', 'gamma'],
        autoHighlight: 'always',
        open: true
      })

      const input = screen.getByRole<HTMLInputElement>('combobox')
      const firstOption = await screen.findByRole('option', { name: 'alpha' })

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', firstOption.id)
      })
      expect(firstOption).toHaveAttribute('data-highlighted')
    })

    it('restores the first highlight after an always-highlighted query becomes empty', async () => {
      const user = userEvent.setup()
      render(AlwaysHighlightListAutocomplete)

      const input = screen.getByRole('combobox')
      await user.type(input, 'z')
      expect(screen.queryByRole('option')).toBeNull()

      await user.clear(input)

      await waitFor(() =>
        expect(screen.getByRole('option', { name: 'apple' })).toHaveAttribute('data-highlighted')
      )
    })

    it('keeps the latest pointer highlight on outside blur when behavior is "always"', async () => {
      render(InlineAlwaysAutocomplete)

      const input = screen.getByTestId<HTMLInputElement>('input')
      const banana = screen.getByRole('option', { name: 'banana' })

      fireEvent.focus(input)
      fireEvent.pointerMove(banana)
      fireEvent.mouseMove(banana)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', banana.id)
      })
      expect(banana).toHaveAttribute('data-highlighted')

      const outside = screen.getByTestId('outside')
      fireEvent.pointerDown(outside)
      fireEvent.blur(input, { relatedTarget: outside })
      fireEvent.focus(outside)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant', banana.id)
      })
      expect(banana).toHaveAttribute('data-highlighted')
      expect(screen.getByRole('option', { name: 'apple' })).not.toHaveAttribute('data-highlighted')
    })
  })

  describe('prop: keepHighlight', () => {
    it('keeps the current highlight when the pointer leaves the list', async () => {
      render(KeepHighlightAutocomplete, { keepHighlight: true })

      const input = screen.getByTestId('autocomplete-input')
      fireEvent.click(input)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      const apple = screen.getByRole('option', { name: 'apple' })

      fireEvent.pointerMove(apple)
      fireEvent.mouseMove(apple)

      await waitFor(() => {
        expect(apple).toHaveAttribute('data-highlighted')
      })

      fireEvent.pointerLeave(apple, { pointerType: 'mouse', relatedTarget: document.body })

      await waitFor(() => {
        expect(apple).toHaveAttribute('data-highlighted')
      })
    })

    it('continues keyboard navigation from the kept highlight after pointer leave', async () => {
      const user = userEvent.setup()
      render(KeepHighlightAutocomplete, { keepHighlight: true, autoHighlight: true })

      const input = screen.getByTestId('autocomplete-input')
      await user.type(input, 'a')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      const apple = screen.getByRole('option', { name: 'apple' })
      await waitFor(() => {
        expect(apple).toHaveAttribute('data-highlighted')
      })

      fireEvent.pointerLeave(apple, { pointerType: 'mouse', relatedTarget: document.body })

      await waitFor(() => {
        expect(apple).toHaveAttribute('data-highlighted')
      })

      fireEvent.keyDown(input, { key: 'ArrowDown' })

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'banana' })).toHaveAttribute('data-highlighted')
      })
    })
  })

  describe('prop: mode', () => {
    it.each(['list', 'both'] as const)(
      'mode="%s": uses the locale when applying the default filter',
      async (mode) => {
        const user = userEvent.setup()
        render(ItemsAutocomplete, { items: ['Isparta', 'İzmir'], mode, locale: 'tr' })

        await user.type(screen.getByRole('combobox'), 'i')

        await waitFor(() => {
          expect(screen.queryByRole('option', { name: 'Isparta' })).toBeNull()
        })
        expect(screen.getByRole('option', { name: 'İzmir' })).not.toBeNull()
      }
    )

    it('mode="list" (default): no inline overlay, consumer handles filtering', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, { items: ['apple', 'banana', 'cherry'], mode: 'list' })

      const input = screen.getByRole<HTMLInputElement>('combobox')
      await user.click(input)
      await user.type(input, 'a')

      expect(screen.getAllByRole('option')).toHaveLength(2)

      await user.keyboard('{ArrowDown}')

      expect(input.value).toBe('a')
      expect(screen.getAllByRole('option')).toHaveLength(2)
    })

    it('mode="both": inline overlay + autocomplete handles filtering', async () => {
      const user = userEvent.setup()
      render(ItemsAutocomplete, {
        items: ['apple', 'banana', 'cherry'],
        mode: 'both',
        openOnInputClick: true
      })

      const input = screen.getByTestId<HTMLInputElement>('input')
      await user.click(input)
      await user.type(input, 'a')

      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(2)
      })

      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        expect(input.value).toBe('apple')
      })
      expect(screen.getAllByRole('option')).toHaveLength(2)
    })

    it('mode="both": hovering items should not change the inline overlay (preserve temporary value)', async () => {
      const user = userEvent.setup({ delay: null })
      render(InlineModeAutocomplete, { mode: 'both' })

      const input = screen.getByTestId<HTMLInputElement>('autocomplete-input')
      await user.click(input)
      await user.type(input, 'a')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        expect(input.value).toBe('apple')
      })

      const banana = screen.getByRole('option', { name: 'banana' })
      fireEvent.mouseMove(banana)
      await waitFor(() => {
        expect(banana).toHaveAttribute('data-highlighted')
      })
      expect(input.value).toBe('apple')
    })

    it('mode="both": external controlled updates replace the temporary inline value', async () => {
      const user = userEvent.setup()
      render(ControlledValueAutocomplete)

      const input = screen.getByRole<HTMLInputElement>('combobox')
      await user.type(input, 'a')
      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        expect(input.value).toBe('apple')
      })

      await user.click(screen.getByTestId('update'))

      await waitFor(() => {
        expect(input.value).toBe('ba')
      })
    })

    it('mode="inline": static items with inline overlay', async () => {
      const user = userEvent.setup()
      render(InlineModeAutocomplete, { mode: 'inline', openOnInputClick: true })

      const input = screen.getByTestId<HTMLInputElement>('autocomplete-input')
      await user.click(input)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      expect(screen.getAllByRole('option')).toHaveLength(3)

      await user.keyboard('{ArrowDown}')

      await waitFor(() => {
        expect(input.value).toBe('apple')
      })

      await user.type(input, 'b')

      expect(input.value).toBe('appleb')
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    it('mode="none": static items without inline overlay', async () => {
      const user = userEvent.setup()
      render(InlineModeAutocomplete, { mode: 'none', openOnInputClick: true })

      const input = screen.getByTestId<HTMLInputElement>('autocomplete-input')
      fireEvent.click(input)

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      expect(screen.getAllByRole('option')).toHaveLength(3)

      await user.keyboard('{ArrowDown}')

      expect(input.value).toBe('')
      expect(screen.getAllByRole('option')).toHaveLength(3)

      await user.type(input, 'x')
      await user.keyboard('{ArrowDown}')

      expect(input.value).toBe('x')
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })
  })

  describe('scroll reset on input value change', () => {
    it.skipIf(isJSDOM)('resets the list scroll position to the top when typing', async () => {
      const user = userEvent.setup()
      render(ScrollListAutocomplete, {
        items: Array.from({ length: 50 }, (_, index) =>
          index < 25 ? `alpha-${index}` : `beta-${index - 25}`
        ),
        openOnInputClick: true
      })

      const input = screen.getByTestId('input')
      await user.click(input)

      const list = await screen.findByRole('listbox')
      list.scrollTop = 40
      expect(list.scrollTop).toBeGreaterThan(0)

      await user.type(input, 'b')

      await waitFor(() => {
        expect(list.scrollTop).toBe(0)
      })
    })

    it.skipIf(isJSDOM)(
      'mode="both": inline navigation does not reset the scroll to the top',
      async () => {
        const user = userEvent.setup()
        render(ScrollListAutocomplete, {
          items: Array.from({ length: 50 }, (_, index) => `item-${index}`),
          mode: 'both'
        })

        const input = screen.getByTestId<HTMLInputElement>('input')
        await user.click(input)
        await user.type(input, 'item')

        for (let i = 0; i < 20; i += 1) {
          await user.keyboard('{ArrowDown}')
        }

        const list = screen.getByRole('listbox')
        await waitFor(() => {
          expect(list.scrollTop).toBeGreaterThan(0)
        })
      }
    )
  })

  describe('prop: filter', () => {
    it.each(['list', 'both'] as const)(
      'mode="%s": uses a custom filter instead of the locale-aware default',
      async (mode) => {
        const user = userEvent.setup()
        render(ItemsAutocomplete, {
          items: ['Isparta', 'İzmir'],
          mode,
          locale: 'tr',
          filter: (item: string, query: string) => item[0] === query.toUpperCase()
        })

        await user.type(screen.getByRole('combobox'), 'i')

        await waitFor(() => {
          expect(screen.queryByRole('option', { name: 'İzmir' })).toBeNull()
        })
        expect(screen.getByRole('option', { name: 'Isparta' })).not.toBeNull()
      }
    )

    it.each(['list', 'both'] as const)(
      'mode="%s": does not apply default filtering when filter is null',
      async (mode) => {
        const user = userEvent.setup()
        render(ItemsAutocomplete, { items: ['apple', 'banana', 'cherry'], mode, filter: null })

        const input = screen.getByTestId('input')
        await user.click(input)
        await user.type(input, 'zzz')

        await waitFor(() => {
          expect(screen.queryByRole('listbox')).not.toBeNull()
        })

        expect(screen.getAllByRole('option')).toHaveLength(3)
      }
    )
  })

  describe('prop: value', () => {
    it('treats a controlled null value as an empty query', async () => {
      render(NullValueAutocomplete)

      expect(screen.getByRole('combobox')).toHaveValue('')
      expect(await screen.findByRole('option', { name: 'apple' })).not.toBeNull()
    })
  })

  describe('prop: inline', () => {
    it('does not fill the input when an item is pressed without a popup', async () => {
      const user = userEvent.setup()
      render(InlineListAutocomplete)

      const input = screen.getByTestId('input')
      await user.click(screen.getByRole('option', { name: 'alpha' }))

      expect(input).toHaveValue('')
    })
  })

  describe('prop: submitOnItemClick', () => {
    it('prevents submit on Enter when an item is highlighted by default (false)', async () => {
      let submitted = 0
      const user = userEvent.setup()

      render(AutocompleteInForm, {
        submitOnItemClick: false,
        onFormSubmit: () => {
          submitted += 1
        }
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.type(input, 'al')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      fireEvent.keyDown(input, { key: 'ArrowDown' })

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant')
      })

      fireEvent.keyDown(input, { key: 'Enter' })

      expect(submitted).toBe(0)
    })

    it('when true, clicking with pointer submits the owning form', async () => {
      const onFormSubmit = vi.fn<(data: FormData) => void>()
      const user = userEvent.setup()

      render(AutocompleteInForm, {
        name: 'q',
        submitOnItemClick: true,
        onFormSubmit
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'al')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      await user.click(screen.getByRole('option', { name: 'alpha' }))

      await waitFor(() => {
        expect(onFormSubmit).toHaveBeenCalled()
      })
      expect(onFormSubmit.mock.calls[0][0].get('q')).toBe('alpha')
    })

    it('submits the input form when the Autocomplete is not wrapped in a Field', async () => {
      let submitted = 0
      const user = userEvent.setup()
      render(UnscopedForm, {
        onFormSubmit: () => {
          submitted += 1
        }
      })

      await user.type(screen.getByRole('combobox'), 'a')
      await user.click(screen.getByRole('option', { name: 'alpha' }))

      await waitFor(() => {
        expect(submitted).toBe(1)
      })
    })

    it('does not request form submission when no form owns the autocomplete', async () => {
      render(ItemClickSubmitAutocomplete, { withForm: false })

      fireEvent.click(screen.getByRole('option', { name: 'apple' }))

      await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('apple'))
    })

    it('does not request form submission when requestSubmit is unavailable', async () => {
      render(ItemClickSubmitAutocomplete, { withForm: true })

      const form = screen.getByRole('form', { name: 'search' })
      Object.defineProperty(form, 'requestSubmit', { configurable: true, value: undefined })

      fireEvent.click(screen.getByRole('option', { name: 'apple' }))

      await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('apple'))
    })

    it('validates the autocomplete input when focus leaves its popup', async () => {
      const user = userEvent.setup()
      const validate = vi.fn()
      render(FieldPopupInputAutocomplete, { validate })

      await user.click(document.body)

      await waitFor(() => expect(validate).toHaveBeenCalledWith('query', expect.anything()))
    })

    it('when true, pressing Enter in the Input submits the owning form when an item is highlighted', async () => {
      const onFormSubmit = vi.fn<(data: FormData) => void>()
      const user = userEvent.setup()

      render(AutocompleteInForm, {
        name: 'q',
        submitOnItemClick: true,
        onFormSubmit
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'al')

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeNull()
      })

      fireEvent.keyDown(input, { key: 'ArrowDown' })

      await waitFor(() => {
        expect(document.querySelector('[data-highlighted]')).not.toBeNull()
      })

      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(onFormSubmit).toHaveBeenCalled()
      })
      expect(onFormSubmit.mock.calls[0][0].get('q')).toBe('alpha')
    })

    it.skipIf(isJSDOM)('clicking an option submits an associated external form', async () => {
      const onFormSubmit = vi.fn<(data: FormData) => void>()
      const user = userEvent.setup()
      render(ExternalForm, {
        name: 'q',
        submitOnItemClick: true,
        onFormSubmit
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'al')
      await user.click(screen.getByRole('option', { name: 'alpha' }))

      await waitFor(() => {
        expect(onFormSubmit).toHaveBeenCalled()
      })
      expect(onFormSubmit.mock.calls[0][0].get('q')).toBe('alpha')
    })

    it('focusing the listbox should keep the input focused and maintain functionality', async () => {
      const submitted: FormData[] = []
      const user = userEvent.setup()
      render(SubmitForm, {
        name: 'q',
        items: ['alpha', 'alpine'],
        submitOnItemClick: true,
        onFormSubmit: (data: FormData) => submitted.push(data)
      })

      const input = screen.getByRole('combobox')
      await user.type(input, 'al')
      await user.keyboard('{ArrowDown}')

      const alpha = screen.getByRole('option', { name: 'alpha' })
      await waitFor(() => expect(alpha).toHaveAttribute('data-highlighted'))

      screen.getByTestId('listbox').focus()
      expect(input).toHaveFocus()

      await user.keyboard('{Enter}')

      await waitFor(() => expect(submitted.length).toBe(1))
      expect(submitted[0].get('q')).toBe('alpha')
    })
  })

  describe('Form', () => {
    it('submits the typed input value when wrapped in Field.Root', async () => {
      let submitted: string | null = null
      const user = userEvent.setup()

      const { container } = render(AutocompleteInForm, {
        name: 'search',
        onFormSubmit: (data: FormData) => {
          submitted = data.get('search') as string
        }
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'hello world')

      expect(input).toHaveValue('hello world')

      fireEvent.submit(container.querySelector('form')!)

      expect(submitted).toBe('hello world')
    })

    it('submits the typed input value when name is provided on Autocomplete.Root', async () => {
      let submitted: FormDataEntryValue | null = null
      const user = userEvent.setup()

      render(AutocompleteInForm, {
        name: 'query',
        onFormSubmit: (data: FormData) => {
          submitted = data.get('query')
        }
      })

      const input = screen.getByRole<HTMLInputElement>('combobox')
      await user.type(input, 'base ui')

      expect(input).toHaveAttribute('name', 'query')
      expect(input.value).toBe('base ui')

      await user.click(screen.getByTestId('submit'))

      await waitFor(() => expect(submitted).toBe('base ui'))
    })

    it('submits the popup input value through native FormData when rendering a field-aware input', async () => {
      const submitted: FormData[] = []
      const user = userEvent.setup()
      render(InputInPopupForm, {
        name: 'search',
        items: ['alpha', 'alpine'],
        onFormSubmit: (data: FormData) => submitted.push(data)
      })

      await user.click(screen.getByRole('combobox'))
      const input = await screen.findByTestId('input')
      expect(input).not.toHaveAttribute('name')

      await user.click(screen.getByRole('option', { name: 'alpha' }))

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('alpha')
      })

      await user.click(screen.getByTestId('submit'))

      await waitFor(() => expect(submitted.length).toBe(1))
      expect(submitted[0].get('search')).toBe('alpha')
    })

    it('submits the inline input value through native FormData', async () => {
      const submitted: FormData[] = []
      const user = userEvent.setup()
      render(InlineForm, {
        name: 'search',
        items: ['alpha', 'alpine'],
        onFormSubmit: (data: FormData) => submitted.push(data)
      })

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('name', 'search')
      expect(screen.getByRole('textbox', { hidden: true })).not.toHaveAttribute('name')

      await user.type(input, 'alp')
      await user.click(screen.getByTestId('submit'))

      await waitFor(() => expect(submitted.length).toBe(1))
      expect(submitted[0].get('search')).toBe('alp')
    })

    it('submits a default popup input value through native FormData before the popup opens', async () => {
      const submitted: FormData[] = []
      const user = userEvent.setup()
      render(InputInPopupForm, {
        name: 'search',
        items: ['alpha', 'alpine'],
        value: 'alpha',
        onFormSubmit: (data: FormData) => submitted.push(data)
      })

      await user.click(screen.getByTestId('submit'))

      await waitFor(() => expect(submitted.length).toBe(1))
      expect(submitted[0].get('search')).toBe('alpha')
    })

    it.skipIf(isJSDOM)('submits to an external form when `form` is provided', async () => {
      const onFormSubmit = vi.fn<(data: FormData) => void>()
      const user = userEvent.setup()
      render(ExternalForm, {
        name: 'query',
        items: ['alpha', 'alpine'],
        withSubmitButton: true,
        onFormSubmit
      })

      await user.type(screen.getByTestId('input'), 'base ui')
      await user.click(screen.getByTestId('external-submit'))

      await waitFor(() => expect(onFormSubmit).toHaveBeenCalled())
      expect(onFormSubmit.mock.calls[0][0].get('query')).toBe('base ui')
    })

    it('triggers native validation when required and empty', async () => {
      const user = userEvent.setup()
      render(RequiredForm)

      expect(screen.queryByTestId('error')).toBeNull()

      await user.click(screen.getByTestId('submit'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('required')
      })
    })

    it('clears external errors on change', async () => {
      const user = userEvent.setup()
      render(ErrorsForm, { errors: { autocomplete: 'test' } })

      expect(screen.getByTestId('error')).toHaveTextContent('test')

      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-invalid', 'true')

      await user.type(input, 'test input')

      await waitFor(() => {
        expect(screen.queryByTestId('error')).toBeNull()
      })
      expect(input).not.toHaveAttribute('aria-invalid')
    })

    it('submits the input value directly (not selection value)', async () => {
      let submitted: string | null = null
      const user = userEvent.setup()

      const { container } = render(AutocompleteInForm, {
        name: 'search',
        onFormSubmit: (data: FormData) => {
          submitted = data.get('search') as string
        }
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'alp')

      fireEvent.submit(container.querySelector('form')!)

      expect(submitted).toBe('alp')
    })

    it('Enter submits when no item is highlighted', async () => {
      const submitted: FormData[] = []
      const user = userEvent.setup()
      render(SubmitForm, {
        name: 'search',
        items: ['alpha', 'beta'],
        openOnInputClick: true,
        onFormSubmit: (data: FormData) => submitted.push(data)
      })

      await user.click(screen.getByRole('combobox'))
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())

      await user.keyboard('{Enter}')

      await waitFor(() => expect(submitted.length).toBe(1))
    })

    it('pressing Enter in the Input submits the owning form when no item is highlighted', async () => {
      const submitted: FormData[] = []
      const user = userEvent.setup()
      render(SubmitForm, {
        name: 'q',
        items: ['alpha', 'alpine'],
        submitOnItemClick: true,
        onFormSubmit: (data: FormData) => submitted.push(data)
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'xyz')
      await user.keyboard('{Enter}')

      await waitFor(() => expect(submitted.length).toBe(1))
      expect(submitted[0].get('q')).toBe('xyz')
    })

    it('pressing Enter in the List when it has focus submits the owning form', async () => {
      const submitted: FormData[] = []
      const user = userEvent.setup()
      render(SubmitForm, {
        name: 'q',
        items: ['alpha', 'alpine'],
        submitOnItemClick: true,
        onFormSubmit: (data: FormData) => submitted.push(data)
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'al')
      await user.keyboard('{ArrowDown}')

      const alpha = screen.getByRole('option', { name: 'alpha' })
      await waitFor(() => expect(alpha).toHaveAttribute('data-highlighted'))

      screen.getByTestId('listbox').focus()

      await user.keyboard('{Enter}')

      await waitFor(() => expect(submitted.length).toBe(1))
      expect(submitted[0].get('q')).toBe('alpha')
    })
  })

  describe('object item stringification', () => {
    it('filters and displays using label for {label} objects', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, {
        items: [{ label: 'United States' }, { label: 'Canada' }, { label: 'Australia' }],
        getLabel: (item: unknown) => (item as { label: string }).label
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.type(input, 'can')

      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(1)
      })
      expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument()
    })

    it('uses itemToStringValue when object lacks label', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, {
        items: [{ country: 'United States' }, { country: 'Canada' }, { country: 'Australia' }],
        itemToStringValue: (i: unknown) => (i as { country: string }).country,
        getLabel: (i: unknown) => (i as { country: string }).country
      })

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.type(input, 'can')

      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(1)
      })
      expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument()
    })

    it('filters and displays using value for {value} objects', async () => {
      const user = userEvent.setup()
      render(AutoHighlightItems, {
        items: [{ value: 'United States' }, { value: 'Canada' }, { value: 'Australia' }],
        getLabel: (item: unknown) => (item as { value: string }).value
      })

      const input = screen.getByTestId('input')
      await user.type(input, 'can')

      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(1)
      })
      expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument()
    })
  })

  describe('Field', () => {
    it('sets `required` on the visible input', async () => {
      render(AutocompleteInField, { required: true })

      expect(screen.getByTestId('input')).toHaveAttribute('required')
    })

    it('[data-touched]', async () => {
      render(AutocompleteInField)

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('data-touched')

      fireEvent.focus(input)
      fireEvent.blur(input)

      await waitFor(() => {
        expect(input).toHaveAttribute('data-touched')
      })
    })

    it('[data-dirty]', async () => {
      const user = userEvent.setup()
      render(AutocompleteInField)

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('data-dirty')

      await user.type(input, 'test')

      await waitFor(() => {
        expect(input).toHaveAttribute('data-dirty', '')
      })
    })

    describe('[data-filled]', () => {
      it('adds [data-filled] attribute when input has content', async () => {
        const user = userEvent.setup()
        render(AutocompleteInField)

        const input = screen.getByTestId('input')
        expect(input).not.toHaveAttribute('data-filled')

        await user.type(input, 'test input')

        await waitFor(() => {
          expect(input).toHaveAttribute('data-filled', '')
        })
      })

      it('adds [data-filled] attribute when already filled with an initial value', async () => {
        render(AutocompleteInField, { value: 'initial value' })

        await waitFor(() => {
          expect(screen.getByTestId('input')).toHaveAttribute('data-filled')
        })
      })
    })

    it('[data-focused]', async () => {
      render(AutocompleteInField)

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('data-focused')

      await fireEvent.focus(input)
      expect(input).toHaveAttribute('data-focused')

      await fireEvent.blur(input)
      expect(input).not.toHaveAttribute('data-focused')
    })

    it('[data-invalid]', async () => {
      render(AutocompleteInField, { invalid: true })

      expect(screen.getByTestId('input')).toHaveAttribute('data-invalid')
    })

    it('[data-valid]', async () => {
      const user = userEvent.setup()
      render(AutocompleteInField, { required: true, validationMode: 'onBlur' })

      const input = screen.getByRole('combobox')
      expect(input).not.toHaveAttribute('data-valid')
      expect(input).not.toHaveAttribute('data-invalid')

      await user.type(input, 'ok')
      fireEvent.blur(input)

      await waitFor(() => {
        expect(input).toHaveAttribute('data-valid')
      })
      expect(input).not.toHaveAttribute('data-invalid')
    })

    it('prop: validate', async () => {
      render(AutocompleteInField, { validate: () => 'error', validationMode: 'onBlur' })

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('aria-invalid')

      fireEvent.focus(input)
      fireEvent.blur(input)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('prop: validationMode=onSubmit', async () => {
      const user = userEvent.setup()
      render(ValidationModeForm, {
        validate: (value: unknown) => (value === 'one' ? 'error' : null)
      })

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('aria-invalid')

      await user.click(screen.getByTestId('submit'))
      expect(input).toHaveAttribute('aria-invalid', 'true')

      await user.type(input, 'two')
      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-invalid')
      })

      await user.clear(input)
      await user.type(input, 'one')
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })

      await user.clear(input)
      await user.type(input, 'three')
      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-invalid')
      })
    })

    it.skipIf(!isJSDOM)('prop: validationMode=onChange', async () => {
      const user = userEvent.setup()
      render(AutocompleteInField, {
        validate: (value: unknown) => (value === 'invalid' ? 'error' : null),
        validationMode: 'onChange'
      })

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('aria-invalid')

      await user.type(input, 'invalid')

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it.skipIf(!isJSDOM)('prop: validationMode=onBlur', async () => {
      const user = userEvent.setup()
      render(AutocompleteInField, {
        validate: (value: unknown) => (value === 'invalid' ? 'error' : null),
        validationMode: 'onBlur'
      })

      const input = screen.getByTestId('input')
      expect(input).not.toHaveAttribute('aria-invalid')

      await user.type(input, 'invalid')
      fireEvent.blur(input)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('Field.Label', async () => {
      render(AutocompleteInField)

      const input = screen.getByTestId('input')
      const label = screen.getByTestId('label')
      expect(label.id).toBeTruthy()
      expect(input.getAttribute('aria-labelledby')).toBe(label.id)
    })

    it('Field.Description', async () => {
      render(AutocompleteInField)

      const input = screen.getByTestId('input')
      const description = screen.getByTestId('description')
      expect(description.id).toBeTruthy()
      expect(input.getAttribute('aria-describedby')?.split(' ')).toContain(description.id)
    })
  })
})
