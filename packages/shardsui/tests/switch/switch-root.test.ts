import { Switch } from '$lib/components/switch'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { isGecko, isJSDOM, isWebKit } from '../test-utils'
import BasicSwitch from './fixtures/basic-switch.svelte'
import ButtonSwitch from './fixtures/button-switch.svelte'
import ClickPropagationSwitch from './fixtures/click-propagation-switch.svelte'
import ControlledSwitchInField from './fixtures/controlled-switch-in-field.svelte'
import ControlledSwitch from './fixtures/controlled-switch.svelte'
import NativeCheckboxForm from './fixtures/native-checkbox-form.svelte'
import SwitchDynamicId from './fixtures/switch-dynamic-id.svelte'
import SwitchExternalErrors from './fixtures/switch-external-errors.svelte'
import SwitchExternalForm from './fixtures/switch-external-form.svelte'
import SwitchFormSubmit from './fixtures/switch-form-submit.svelte'
import SwitchImperativeAttachment from './fixtures/switch-imperative-attachment.svelte'
import SwitchInField from './fixtures/switch-in-field.svelte'
import SwitchInFormField from './fixtures/switch-in-form-field.svelte'
import SwitchInFormReset from './fixtures/switch-in-form-reset.svelte'
import SwitchInFormValidation from './fixtures/switch-in-form-validation.svelte'
import SwitchVetoInField from './fixtures/switch-veto-in-field.svelte'
import SwitchWithFieldLabel from './fixtures/switch-with-field-label.svelte'
import SwitchWithLabelFor from './fixtures/switch-with-label-for.svelte'
import SwitchWithWrappingLabel from './fixtures/switch-with-wrapping-label.svelte'

describe('<Switch.Root />', () => {
  describe('prop: onclick', () => {
    it.each(['span', 'button'] as const)(
      'propagates a single click to ancestors (%s)',
      async (as) => {
        const onParentClick = vi.fn()
        render(ClickPropagationSwitch, { as, onParentClick })

        await fireEvent.click(screen.getByRole('switch'))

        expect(onParentClick).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
      }
    )

    it.each(['span', 'button'] as const)(
      'does not propagate to ancestors when stopPropagation() is called (%s)',
      async (as) => {
        const onParentClick = vi.fn()
        render(ClickPropagationSwitch, {
          as,
          onParentClick,
          onclick: (event: MouseEvent) => event.stopPropagation()
        })

        await fireEvent.click(screen.getByRole('switch'))

        expect(onParentClick).toHaveBeenCalledTimes(0)
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
      }
    )

    it('call onclick when clicked', async () => {
      const handleClick = vi.fn()
      render(Switch.Root, { onclick: handleClick })
      const switchElement = screen.getByRole('switch')

      await fireEvent.click(switchElement)

      expect(handleClick.mock.calls.length).toBe(1)
    })
  })

  describe('extra props', () => {
    it('overrides the built-in attributes', () => {
      render(Switch.Root, { role: 'checkbox', 'data-testid': 'switch' })
      expect(screen.getByTestId('switch')).toHaveAttribute('role', 'checkbox')
    })

    it('sets aria-labelledby from a sibling label associated with the hidden input', () => {
      render(SwitchWithLabelFor, { id: 'switch-input' })
      const label = screen.getByTestId('label')
      expect(label.id).not.toBe('')
      expect(screen.getByRole('switch')).toHaveAttribute('aria-labelledby', label.id)
    })

    it.skipIf(isGecko || isWebKit)(
      'updates fallback aria-labelledby when the hidden input id changes',
      async () => {
        render(SwitchDynamicId, { id: 'switch-input-a' })
        const switchElement = screen.getByRole('switch')
        const labelA = screen.getByText('Label A')

        expect(labelA.id).not.toBe('')
        expect(switchElement).toHaveAttribute('aria-labelledby', labelA.id)

        fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))

        await waitFor(() => {
          const labelB = screen.getByText('Label B')
          expect(labelB.id).not.toBe('')
          expect(labelA.id).not.toBe(labelB.id)
          expect(switchElement).toHaveAttribute('aria-labelledby', labelB.id)
        })
      }
    )
  })

  describe('interactions', () => {
    it('tolerates imperative interaction from an attachment before the hidden input mounts', () => {
      render(SwitchImperativeAttachment)

      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    })

    it('ignores a hidden input click that was canceled before it was dispatched', async () => {
      const handleCheckedChange = vi.fn()
      render(BasicSwitch, { onCheckedChange: handleCheckedChange })

      const switchElement = screen.getByRole('switch')
      const input = screen.getByRole('checkbox', { hidden: true })
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      event.preventDefault()

      input.dispatchEvent(event)
      await tick()

      expect(handleCheckedChange).not.toHaveBeenCalled()
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })

    it('change its state when clicked', async () => {
      render(BasicSwitch)
      const switchElement = screen.getByRole('switch')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(switchElement)

      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('updates state when changed from outside in controlled mode', async () => {
      render(ControlledSwitch, { checked: false })
      const switchElement = screen.getByRole('switch')
      const button = screen.getByText('Toggle')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      fireEvent.click(button)
      await waitFor(() => expect(switchElement).toHaveAttribute('aria-checked', 'true'))

      fireEvent.click(button)
      await waitFor(() => expect(switchElement).toHaveAttribute('aria-checked', 'false'))
    })

    it('updates state when the underlying input is toggled', async () => {
      render(BasicSwitch)
      const switchElement = screen.getByRole('switch')
      const internalInput = screen.getByRole('checkbox', { hidden: true })

      await fireEvent.click(internalInput)

      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('can be activated with Enter key', async () => {
      const user = userEvent.setup()
      render(BasicSwitch)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.keyboard('[Tab]')
      expect(switchElement).toHaveFocus()

      await user.keyboard('[Enter]')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('can be activated with Space key', async () => {
      const user = userEvent.setup()
      render(BasicSwitch)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.keyboard('[Tab]')
      expect(switchElement).toHaveFocus()

      await user.keyboard('[Space]')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('prop: disabled', () => {
    it('uses aria-disabled instead of HTML disabled', () => {
      render(BasicSwitch, { disabled: true })
      expect(screen.getByRole('switch')).not.toHaveAttribute('disabled')
      expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not have the disabled attribute when disabled is not set', () => {
      render(BasicSwitch)
      expect(screen.getByRole('switch')).not.toHaveAttribute('disabled')
    })

    it('does not change state when clicked', async () => {
      render(BasicSwitch, { disabled: true })
      const switchElement = screen.getByRole('switch')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(switchElement)

      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: readOnly', () => {
    it('have the aria-readonly attribute', () => {
      render(BasicSwitch, { readOnly: true })
      expect(screen.getByRole('switch')).toHaveAttribute('aria-readonly', 'true')
    })

    it('does not have aria-readonly when readOnly is not set', () => {
      render(BasicSwitch)
      expect(screen.getByRole('switch')).not.toHaveAttribute('aria-readonly')
    })

    it('does not change state when clicked', async () => {
      render(BasicSwitch, { readOnly: true })
      const switchElement = screen.getByRole('switch')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(switchElement)

      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })

    it('does not change state when its label is clicked', async () => {
      render(SwitchWithWrappingLabel, { readOnly: true })
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByTestId('label'))

      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: required', () => {
    it('have the aria-required attribute', () => {
      render(BasicSwitch, { required: true })
      expect(screen.getByRole('switch')).toHaveAttribute('aria-required', 'true')
    })

    it('does not have the aria attribute when required is not set', () => {
      render(BasicSwitch)
      expect(screen.getByRole('switch')).not.toHaveAttribute('aria-required')
    })
  })

  describe('prop: onCheckedChange', () => {
    it('call onCheckedChange when clicked', async () => {
      const handleChange = vi.fn()
      render(BasicSwitch, { onCheckedChange: handleChange })
      const switchElement = screen.getByRole('switch')

      await fireEvent.click(switchElement)

      expect(handleChange.mock.calls.length).toBe(1)
      expect(handleChange.mock.calls[0][0]).toBe(true)
    })

    it('leaves the Field state untouched when a root click is rejected', async () => {
      const user = userEvent.setup()
      render(SwitchVetoInField)

      const switchElement = screen.getByTestId('switch')
      const input = screen.getByRole<HTMLInputElement>('checkbox', { hidden: true })

      await user.click(switchElement)

      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      expect(input.checked).toBe(false)
      expect(switchElement).not.toHaveAttribute('data-dirty')
      expect(switchElement).not.toHaveAttribute('data-filled')
    })

    it('leaves the Field state untouched when a hidden input click is rejected', async () => {
      const user = userEvent.setup()
      render(SwitchVetoInField)

      const switchElement = screen.getByTestId('switch')
      const input = screen.getByRole<HTMLInputElement>('checkbox', { hidden: true })

      await user.click(input)

      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      expect(input.checked).toBe(false)
      expect(switchElement).not.toHaveAttribute('data-dirty')
      expect(switchElement).not.toHaveAttribute('data-filled')
    })
  })

  describe('style hooks', () => {
    it('place the style hooks on the root and the thumb', async () => {
      const { rerender } = render(BasicSwitch, {
        checked: true,
        disabled: true,
        readOnly: true,
        required: true
      })
      const switchElement = screen.getByRole('switch')
      const thumb = switchElement.querySelector('span')

      expect(switchElement).toHaveAttribute('data-checked', '')
      expect(switchElement).toHaveAttribute('data-disabled', '')
      expect(switchElement).toHaveAttribute('data-readonly', '')
      expect(switchElement).toHaveAttribute('data-required', '')

      expect(thumb).toHaveAttribute('data-checked', '')
      expect(thumb).toHaveAttribute('data-disabled', '')
      expect(thumb).toHaveAttribute('data-readonly', '')
      expect(thumb).toHaveAttribute('data-required', '')

      await rerender({ disabled: false, readOnly: false })
      await fireEvent.click(switchElement)

      expect(switchElement).toHaveAttribute('data-unchecked', '')
      expect(switchElement).not.toHaveAttribute('data-checked')

      expect(thumb).toHaveAttribute('data-unchecked', '')
      expect(thumb).not.toHaveAttribute('data-checked')
    })
  })

  describe('name and value attributes', () => {
    it('set the name attribute only on the input', () => {
      render(BasicSwitch, { name: 'switch-name' })
      const switchElement = screen.getByRole('switch')
      const input = screen.getByRole('checkbox', { hidden: true })

      expect(input).toHaveAttribute('name', 'switch-name')
      expect(switchElement).not.toHaveAttribute('name')
    })

    it('does not set the value attribute by default', () => {
      render(BasicSwitch)
      const input = screen.getByRole('checkbox', { hidden: true })
      expect(input).not.toHaveAttribute('value')
    })

    it('set the value attribute only on the input', () => {
      render(BasicSwitch, { value: '1' })
      const switchElement = screen.getByRole('switch')
      const input = screen.getByRole('checkbox', { hidden: true })

      expect(input).toHaveAttribute('value', '1')
      expect(switchElement).not.toHaveAttribute('value')
    })
  })

  describe('with native <label>', () => {
    it('toggles when a wrapping <label> is clicked', async () => {
      render(SwitchWithWrappingLabel)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByTestId('label'))
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('toggles when an explicitly linked <label> is clicked', async () => {
      render(SwitchWithLabelFor, { id: 'mySwitch' })
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await fireEvent.click(screen.getByTestId('label'))
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('prop: as', () => {
    it('associates `id` with the root when `as="button"`', async () => {
      render(ButtonSwitch, { id: 'mySwitch' })

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('id', 'mySwitch')

      const hiddenInput = screen.getByRole('checkbox', { hidden: true })
      expect(hiddenInput).not.toHaveAttribute('id', 'mySwitch')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      await fireEvent.click(screen.getByTestId('label'))
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('renders a real <button>', async () => {
      const user = userEvent.setup()
      const { container } = render(ButtonSwitch)

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      expect(container.querySelector('button')).toBe(switchElement)

      await user.keyboard('[Tab]')
      expect(switchElement).toHaveFocus()

      await user.keyboard('[Enter]')
      expect(switchElement).toHaveAttribute('aria-checked', 'true')

      await user.keyboard('[Space]')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('Form', () => {
    it.skipIf(isJSDOM)(
      'preserves Field validation props through rejected changes, submit, and reset',
      async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(SwitchInFormReset, { onSubmit })

        const switchElement = screen.getByRole('switch')
        const description = screen.getByTestId('description')
        expect(switchElement).toHaveAttribute(
          'aria-describedby',
          `external-description ${description.id}`
        )

        await user.click(switchElement)
        expect(switchElement).toHaveAttribute('aria-checked', 'false')

        await user.click(screen.getByRole('button', { name: 'Submit' }))
        expect(onSubmit).not.toHaveBeenCalled()
        await waitFor(() => expect(switchElement).toHaveAttribute('aria-invalid', 'true'))
        expect(screen.getByTestId('error')).toHaveTextContent('required')

        await user.click(screen.getByRole('button', { name: 'Allow' }))
        await user.click(switchElement)
        expect(switchElement).toHaveAttribute('aria-checked', 'true')
        await waitFor(() => expect(switchElement).not.toHaveAttribute('aria-invalid'))
        await user.click(screen.getByRole('button', { name: 'Submit' }))
        expect(onSubmit).toHaveBeenCalledTimes(1)

        await user.click(screen.getByRole('button', { name: 'Reset' }))
        expect(switchElement).toHaveAttribute('aria-checked', 'true')
        expect(switchElement).not.toHaveAttribute('aria-invalid')
        expect(switchElement).toHaveAttribute(
          'aria-describedby',
          `external-description ${description.id}`
        )
      }
    )

    it.skipIf(isJSDOM)('matches native checkbox form submission behavior', async () => {
      const user = userEvent.setup()

      const native: { data: FormData | null } = { data: null }
      const { container: nativeContainer } = render(NativeCheckboxForm, {
        onData: (d: FormData) => (native.data = d)
      })

      const nativeCheckbox = within(nativeContainer).getByRole('checkbox')
      const nativeSubmitButton = within(nativeContainer).getByRole('button')

      await user.click(nativeSubmitButton)
      expect(native.data?.get('native')).toBe(null)
      expect(native.data?.getAll('native')).toEqual([])

      await user.click(nativeCheckbox)
      await user.click(nativeSubmitButton)
      expect(native.data?.get('native')).toBe('on')

      const custom: { data: FormData | null } = { data: null }
      const { container: customContainer } = render(SwitchFormSubmit, {
        onData: (d: FormData) => (custom.data = d)
      })

      const customSwitch = within(customContainer).getByRole('switch')
      const customSubmitButton = within(customContainer).getByRole('button')

      await user.click(customSubmitButton)
      expect(custom.data?.get('test-switch')).toBe(null)
      expect(custom.data?.getAll('test-switch')).toEqual([])

      await user.click(customSwitch)
      await user.click(customSubmitButton)
      expect(custom.data?.get('test-switch')).toBe('on')
    })

    it.skipIf(isJSDOM)('submits to an external form when `form` is provided', async () => {
      const onData = vi.fn()
      render(SwitchExternalForm, { onData })

      await fireEvent.click(screen.getByTestId('switch'))
      await fireEvent.click(screen.getByText('Submit'))
      expect(onData).toHaveBeenCalledOnce()
      expect(onData.mock.calls[0][0].get('test-switch')).toBe('on')
    })

    it('triggers native HTML validation on submit', async () => {
      render(SwitchInFormField, { required: true })

      expect(screen.queryByTestId('error')).toBe(null)

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        const error = screen.getByTestId('error')
        expect(error).toHaveTextContent('required')
      })
    })

    it('clears external errors on change', async () => {
      render(SwitchExternalErrors)
      const switchElement = screen.getByTestId('switch')

      expect(switchElement).toHaveAttribute('aria-invalid', 'true')
      expect(screen.queryByTestId('error')).toHaveTextContent('test')

      fireEvent.click(switchElement)

      await waitFor(() => {
        expect(switchElement).not.toHaveAttribute('aria-invalid')
      })
      expect(screen.queryByTestId('error')).toBeNull()
    })
  })

  describe('Field integration', () => {
    it('receive disabled prop from Field.Root', () => {
      render(SwitchInField, { disabled: true })
      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toHaveAttribute('data-disabled')
    })

    it('receive name prop from Field.Root', () => {
      render(SwitchInField, { name: 'field-switch' })
      const input = screen.getByRole('checkbox', { hidden: true })
      expect(input).toHaveAttribute('name', 'field-switch')
    })

    it('[data-touched] after focus and blur', async () => {
      render(SwitchInField)
      const switchElement = screen.getByTestId('switch')

      await fireEvent.focus(switchElement)
      await fireEvent.blur(switchElement)

      expect(switchElement).toHaveAttribute('data-touched', '')
    })

    it('[data-dirty] after clicking', async () => {
      render(SwitchInField)
      const switchElement = screen.getByTestId('switch')

      expect(switchElement).not.toHaveAttribute('data-dirty')

      await fireEvent.click(switchElement)

      expect(switchElement).toHaveAttribute('data-dirty', '')
    })

    describe('[data-filled]', () => {
      it('adds [data-filled] when checked after being initially unchecked', async () => {
        render(SwitchInField)
        const switchElement = screen.getByTestId('switch')

        expect(switchElement).not.toHaveAttribute('data-filled')

        await fireEvent.click(switchElement)

        expect(switchElement).toHaveAttribute('data-filled', '')

        await fireEvent.click(switchElement)

        expect(switchElement).not.toHaveAttribute('data-filled')
      })

      it('removes [data-filled] when unchecked after being initially checked', async () => {
        render(SwitchInField, { checked: true })
        const switchElement = screen.getByTestId('switch')

        expect(switchElement).toHaveAttribute('data-filled', '')

        await fireEvent.click(switchElement)

        expect(switchElement).not.toHaveAttribute('data-filled')
      })
    })

    it('does not set [data-focused] when disabled', async () => {
      render(SwitchInField, { disabled: true })

      const button = screen.getByTestId('switch')
      await fireEvent.focus(button)

      expect(button).not.toHaveAttribute('data-focused')
    })

    it('[data-focused] is added on focus and removed on blur', async () => {
      render(SwitchInField)
      const switchElement = screen.getByTestId('switch')

      expect(switchElement).not.toHaveAttribute('data-focused')

      await fireEvent.focus(switchElement)

      expect(switchElement).toHaveAttribute('data-focused', '')

      await fireEvent.blur(switchElement)

      expect(switchElement).not.toHaveAttribute('data-focused')
    })

    it('Field.Description', () => {
      render(SwitchInField, { 'aria-describedby': 'external-description' })

      const description = screen.getByTestId('description')

      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-describedby',
        `external-description ${description.id}`
      )
    })

    it('prop: validationMode=onChange', async () => {
      render(SwitchInField, {
        validationMode: 'onChange',
        validate: (value: unknown) => ((value as boolean) ? 'error' : null)
      })
      const switchElement = screen.getByTestId('switch')

      expect(switchElement).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(switchElement)

      expect(switchElement).toHaveAttribute('aria-invalid', 'true')
    })

    it('prop: validationMode=onBlur', async () => {
      render(SwitchInField, {
        validationMode: 'onBlur',
        validate: (value: unknown) => ((value as boolean) ? 'error' : null)
      })
      const switchElement = screen.getByTestId('switch')

      expect(switchElement).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(switchElement)
      expect(switchElement).not.toHaveAttribute('aria-invalid')

      await fireEvent.blur(switchElement)
      expect(switchElement).toHaveAttribute('aria-invalid', 'true')
    })

    it('prop: validationMode=onSubmit', async () => {
      render(SwitchInFormValidation, { required: true })

      const switchElement = screen.getByTestId('switch')
      expect(switchElement).not.toHaveAttribute('aria-invalid')

      fireEvent.click(screen.getByText('submit'))
      await waitFor(() => expect(switchElement).toHaveAttribute('aria-invalid', 'true'))
      expect(screen.queryByTestId('error')).not.toBe(null)

      fireEvent.click(switchElement)
      await waitFor(() => expect(switchElement).not.toHaveAttribute('aria-invalid'))
      expect(screen.queryByTestId('error')).toBe(null)

      fireEvent.click(switchElement)
      await waitFor(() => expect(switchElement).toHaveAttribute('aria-invalid', 'true'))
      expect(screen.queryByTestId('error')).not.toBe(null)
    })

    it('validates once when changed by the user', async () => {
      const user = userEvent.setup()
      const validate = vi.fn()

      render(SwitchInField, { validationMode: 'onChange', validate })

      await user.click(screen.getByRole('switch'))

      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate.mock.lastCall?.[0]).toBe(true)
    })

    it('revalidates when a controlled value changes externally', async () => {
      const validateSpy = vi.fn((value: unknown) => ((value as boolean) ? 'error' : null))

      render(ControlledSwitchInField, {
        validate: validateSpy,
        validationMode: 'onChange'
      })

      const switchElement = screen.getByTestId('switch')
      const toggle = screen.getByText('Toggle externally')

      expect(switchElement).not.toHaveAttribute('aria-invalid')
      const initialCallCount = validateSpy.mock.calls.length

      fireEvent.click(toggle)

      await waitFor(() => {
        expect(validateSpy.mock.calls.length).toBe(initialCallCount + 1)
        expect(validateSpy.mock.lastCall?.[0]).toBe(true)
        expect(switchElement).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('commits validity against the flushed input when the controlled value changes externally', async () => {
      render(ControlledSwitchInField, { validationMode: 'onChange', required: true })

      const switchElement = screen.getByTestId('switch')
      const toggle = screen.getByText('Toggle externally')

      expect(switchElement).not.toHaveAttribute('aria-invalid')

      await fireEvent.click(toggle)

      expect(switchElement).not.toHaveAttribute('aria-invalid')
      expect(switchElement).not.toHaveAttribute('data-invalid')
    })

    describe('Field.Label', () => {
      describe('implicit', () => {
        it('sets for on the label and aria-labelledby on switch', async () => {
          render(SwitchWithFieldLabel, { labelPosition: 'implicit' })

          const label = screen.getByTestId('label')
          expect(label.getAttribute('for')).not.toBe(null)

          const input = document.querySelector('input[type="checkbox"]')
          expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))

          const switchElement = screen.getByRole('switch')
          expect(switchElement.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
          expect(switchElement).toHaveAttribute('aria-checked', 'false')

          await fireEvent.click(label)
          expect(switchElement).toHaveAttribute('aria-checked', 'true')
        })
      })

      describe('explicit association', () => {
        it('when the label is sibling to the switch', async () => {
          render(SwitchWithFieldLabel, { labelPosition: 'sibling' })

          const label = screen.getByTestId('label')
          const switchElement = screen.getByRole('switch')
          const input = document.querySelector('input[type="checkbox"]')

          expect(label.getAttribute('for')).not.toBe(null)
          expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))
          expect(switchElement.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
          expect(switchElement).toHaveAttribute('aria-checked', 'false')

          await fireEvent.click(label)
          expect(switchElement).toHaveAttribute('aria-checked', 'true')
        })

        it('when the label renders as a span', async () => {
          render(SwitchWithFieldLabel, { labelPosition: 'nonNativeLabel' })

          const label = screen.getByTestId('label')
          const switchElement = screen.getByRole('switch')

          expect(label.getAttribute('for')).toBe(null)
          expect(label.getAttribute('id')).not.toBe(null)
          expect(switchElement.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
          expect(switchElement).toHaveAttribute('aria-checked', 'false')

          await fireEvent.click(label)
          expect(switchElement).not.toHaveAttribute('aria-checked', 'true')
        })
      })
    })
  })
})
