import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ClosedTypeahead from './fixtures/closed-typeahead.svelte'
import SelectClosedTypeahead from './fixtures/select-closed-typeahead.svelte'
import SelectOpenDisabledTypeahead from './fixtures/select-open-disabled-typeahead.svelte'
import SelectOpenTypeahead from './fixtures/select-open-typeahead.svelte'
import SelectRenamedItem from './fixtures/select-renamed-item.svelte'
import SelectWithItemsLookup from './fixtures/select-with-items-lookup.svelte'

describe('<Select.Root />', () => {
  describe('typeahead', () => {
    it('skips disabled items and commits the next match via typeahead on a closed trigger', async () => {
      const user = userEvent.setup()
      render(ClosedTypeahead, {
        items: [
          { value: 'apricot', label: 'apricot', disabled: true },
          { value: 'avocado', label: 'avocado' }
        ]
      })

      const trigger = screen.getByTestId('trigger')
      const valueElement = screen.getByTestId('value')

      trigger.focus()
      await user.keyboard('a')
      await waitFor(() => expect(valueElement.textContent).toBe('avocado'))
    })

    it('commits typeahead on a closed trigger when items are provided', async () => {
      const user = userEvent.setup()
      render(SelectWithItemsLookup, { items: { apple: 'Apple', cherry: 'Cherry' } })

      screen.getByTestId('trigger').focus()
      await user.keyboard('c')

      await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('Cherry'))
      expect(screen.queryByRole('listbox')).toBe(null)
    })

    it('commits nothing when the only typeahead match is disabled (closed trigger)', async () => {
      const user = userEvent.setup()
      render(ClosedTypeahead, {
        items: [
          { value: 'cherry', label: 'cherry' },
          { value: 'banana', label: 'banana', disabled: true }
        ]
      })

      const trigger = screen.getByTestId('trigger')
      const valueElement = screen.getByTestId('value')

      trigger.focus()
      await user.keyboard('b')
      expect(valueElement.textContent).toBe('')
    })

    it('does not let a disabled double-letter item block rapid cycling among enabled matches', async () => {
      const user = userEvent.setup()
      render(ClosedTypeahead, {
        items: [
          { value: 'aaron', label: 'aaron', disabled: true },
          { value: 'apple', label: 'apple' },
          { value: 'avocado', label: 'avocado' }
        ]
      })

      const trigger = screen.getByTestId('trigger')
      const valueElement = screen.getByTestId('value')

      trigger.focus()
      await user.keyboard('a')
      await waitFor(() => expect(valueElement.textContent).toBe('apple'))
      await user.keyboard('a')
      await waitFor(() => expect(valueElement.textContent).toBe('avocado'))
    })

    it('starts from the first match after value reset (closed)', async () => {
      const user = userEvent.setup()
      render(ClosedTypeahead, {
        items: [
          { value: 'a1', label: 'A1' },
          { value: 'a2', label: 'A2' }
        ]
      })

      const trigger = screen.getByTestId('trigger')
      const valueElement = screen.getByTestId('value')

      trigger.focus()
      await user.keyboard('a')
      await waitFor(() => expect(valueElement.textContent).toBe('a1'))

      await user.click(screen.getByTestId('reset'))

      trigger.focus()
      await user.keyboard('a')
      await waitFor(() => expect(valueElement.textContent).toBe('a1'))
    })

    it('does not jump matches after a closed-state value reset', async () => {
      const user = userEvent.setup()
      render(SelectClosedTypeahead, { value: 'dog', options: ['car', 'cat', 'dog'] })

      const trigger = screen.getByTestId('trigger')
      const valueElement = screen.getByTestId('value')
      const setCarButton = screen.getByTestId('set-car')

      expect(valueElement.textContent).toBe('dog')

      await user.click(setCarButton)
      await waitFor(() => expect(valueElement.textContent).toBe('car'))

      trigger.focus()
      await user.keyboard('c')
      await waitFor(() => expect(valueElement.textContent).toBe('cat'))

      await user.keyboard('a')
      await waitFor(() => expect(valueElement.textContent).toBe('cat'))
    })
    it.skipIf(isJSDOM)(
      'does not trigger selection when Space is pressed during text navigation',
      async () => {
        const user = userEvent.setup()
        const onItemClick = vi.fn()
        const onValueChange = vi.fn()
        render(SelectOpenTypeahead, { onItemClick, onValueChange })

        const options = screen.getAllByRole('option')
        options[0].focus()

        await user.keyboard('Item T')

        expect(onItemClick).not.toHaveBeenCalled()
        expect(onValueChange).not.toHaveBeenCalled()
        await waitFor(() => expect(options[1]).toHaveFocus())
      }
    )

    it.skipIf(isJSDOM)(
      'skips disabled items when highlighting via typeahead on an open popup',
      async () => {
        const user = userEvent.setup()
        render(SelectOpenDisabledTypeahead)

        const apricot = screen.getByRole('option', { name: 'apricot' })
        const avocado = screen.getByRole('option', { name: 'avocado' })
        avocado.focus()

        await user.keyboard('a')

        await waitFor(() => expect(avocado).toHaveAttribute('data-highlighted'))
        expect(apricot).not.toHaveAttribute('data-highlighted')
      }
    )

    it.skipIf(isJSDOM)(
      'allows a pointer click after a typeahead sequence that ends with Space',
      async () => {
        const user = userEvent.setup()
        render(SelectOpenTypeahead)

        const [firstItem, secondItem] = screen.getAllByRole('option')
        firstItem.focus()

        await user.keyboard('item t ')

        await waitFor(() => expect(secondItem).toHaveFocus())

        await user.click(secondItem)

        await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('two'))
      }
    )

    it('reads item text live when an item is renamed but keeps its value', async () => {
      const user = userEvent.setup()
      render(SelectRenamedItem)

      const [firstItem, secondItem] = screen.getAllByRole('option')
      await user.click(screen.getByTestId('rename'))
      await waitFor(() => expect(firstItem.textContent).toBe('Alpha one'))

      secondItem.focus()
      await user.keyboard('alpha o')

      await waitFor(() => expect(firstItem).toHaveFocus())
    })
  })
})
