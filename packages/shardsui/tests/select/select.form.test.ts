import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import FormSubmit from './fixtures/form-submit.svelte'
import MultipleSelect from './fixtures/multiple-select.svelte'
import SelectExternalForm from './fixtures/select-external-form.svelte'
import SelectFormRequired from './fixtures/select-form-required.svelte'
import SelectNativeForm from './fixtures/select-native-form.svelte'
import SelectWithItems from './fixtures/select-with-items.svelte'

function hiddenInput(container: HTMLElement) {
  return container.querySelector('input[aria-hidden="true"]') as HTMLInputElement
}

describe('<Select.Root />', () => {
  describe('prop: itemToStringValue', () => {
    type CountryItem = { country: string; code: string }

    it('uses itemToStringValue for multiple selection form submission', () => {
      const items: CountryItem[] = [
        { country: 'United States', code: 'US' },
        { country: 'Canada', code: 'CA' },
        { country: 'Australia', code: 'AU' }
      ]

      const { container } = render(SelectWithItems, {
        name: 'countries',
        multiple: true,
        value: [items[0], items[1]],
        items,
        itemToStringLabel: (item: CountryItem) => item.country,
        itemToStringValue: (item: CountryItem) => item.code
      } as unknown as Record<string, unknown>)

      const hiddenInputs = container.querySelectorAll('input[name="countries"]')
      expect(hiddenInputs).toHaveLength(2)
      expect((hiddenInputs[0] as HTMLInputElement).value).toBe('US')
      expect((hiddenInputs[1] as HTMLInputElement).value).toBe('CA')
    })

    it('uses itemToStringValue for form submission', () => {
      const items: CountryItem[] = [
        { country: 'United States', code: 'US' },
        { country: 'Canada', code: 'CA' }
      ]

      const { container } = render(SelectWithItems, {
        name: 'country',
        value: items[0],
        items,
        itemToStringLabel: (item: CountryItem) => item.country,
        itemToStringValue: (item: CountryItem) => item.code
      } as unknown as Record<string, unknown>)

      const hiddenInput = container.querySelector('input[name="country"]')
      expect(hiddenInput).toBeTruthy()
      expect((hiddenInput as HTMLInputElement).value).toBe('US')
    })
  })

  describe('prop: multiple', () => {
    it('does not mark the hidden input as required when a selection exists', () => {
      const { container } = render(MultipleSelect, {
        required: true,
        name: 'select',
        value: ['a']
      })
      const hiddenInput = container.querySelector('input') as HTMLInputElement
      expect(hiddenInput).not.toBe(null)
      expect(hiddenInput).not.toHaveAttribute('required')
    })

    it('keeps the hidden input required when no selection exists', () => {
      const { container } = render(MultipleSelect, {
        required: true,
        name: 'select',
        value: []
      })
      const hiddenInput = container.querySelector('input') as HTMLInputElement
      expect(hiddenInput).not.toBe(null)
      expect(hiddenInput).toHaveAttribute('required')
    })

    it.skipIf(isJSDOM)('does not submit multiple values when disabled', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(SelectNativeForm, { multiple: true, disabled: true, value: ['a', 'c'], onSubmit })

      await user.click(screen.getByRole('button', { name: 'Submit' }))

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.lastCall?.[0].getAll('select')).toEqual([])
    })
  })

  describe('Form', () => {
    it('submits the stringified value to onFormSubmit when itemToStringValue is provided', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      const { container } = render(FormSubmit, { onFormSubmit })

      expect(hiddenInput(container)).toHaveValue('US')

      await user.click(screen.getByTestId('submit'))

      await waitFor(() => expect(onFormSubmit).toHaveBeenCalled())
      expect(onFormSubmit.mock.lastCall?.[0]).toEqual({ country: 'US' })
    })

    it('triggers native HTML validation on submit', async () => {
      const user = userEvent.setup()
      render(SelectFormRequired, { required: true, matchError: true })

      expect(screen.queryByTestId('error')).toBe(null)

      await user.click(screen.getByTestId('submit'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('required')
      })
    })

    it('revalidates immediately after form submission errors', async () => {
      const user = userEvent.setup()
      render(SelectFormRequired, { required: true, matchError: true })

      await user.click(screen.getByTestId('submit'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('required')
      })
      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-invalid', 'true')

      await user.click(trigger)
      const option = screen.getByRole('option', { name: 'b' })
      await user.pointer({ target: option })
      await user.click(option)

      await waitFor(() => {
        expect(screen.queryByTestId('error')).toBe(null)
      })
      expect(trigger).not.toHaveAttribute('aria-invalid')
    })

    it('clears external errors on change', async () => {
      const user = userEvent.setup()
      render(SelectFormRequired, { errors: { select: 'test' } })

      expect(screen.getByTestId('error')).toHaveTextContent('test')

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-invalid', 'true')

      await user.click(trigger)
      const option = screen.getByRole('option', { name: 'b' })
      await user.pointer({ target: option })
      await user.click(option)

      await waitFor(() => {
        expect(screen.queryByTestId('error')).toBe(null)
      })
      expect(trigger).not.toHaveAttribute('aria-invalid')
    })

    it.skipIf(isJSDOM)('submits to an external form when `form` is provided', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(SelectExternalForm, { value: 'US', onSubmit })

      await user.click(screen.getByRole('button', { name: 'Submit' }))

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.lastCall?.[0].get('country')).toBe('US')
    })

    it.skipIf(isJSDOM)(
      'submits multiple values to an external form when `form` is provided',
      async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(SelectExternalForm, {
          multiple: true,
          name: 'countries',
          value: ['US', 'CA'],
          onSubmit
        })

        await user.click(screen.getByRole('button', { name: 'Submit' }))

        expect(onSubmit).toHaveBeenCalledTimes(1)
        expect(onSubmit.mock.lastCall?.[0].getAll('countries')).toEqual(['US', 'CA'])
      }
    )
  })
})
