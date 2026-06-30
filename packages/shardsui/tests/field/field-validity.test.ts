import { fireEvent, render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DeferredBadInput from './fixtures/deferred-bad-input.svelte'
import FieldValidityCapture from './fixtures/field-validity-capture.svelte'
import StaleCustomErrorValidity from './fixtures/stale-custom-error-validity.svelte'

describe('<Field.Validity />', () => {
  it.each(['onBlur', 'onSubmit'] as const)(
    'surfaces valueMissing immediately after a stale custom error in %s mode',
    async (validationMode) => {
      const onValidity = vi.fn()
      const validate = vi.fn(() => 'custom error')
      render(StaleCustomErrorValidity, { onValidity, validate, validationMode })

      const input = screen.getByTestId('control') as HTMLInputElement

      const establishInvalidState = async () => {
        if (validationMode === 'onBlur') {
          await fireEvent.blur(input)
        } else {
          input.focus()
          await fireEvent.keyDown(input, { key: 'Enter' })
        }
      }

      await fireEvent.focus(input)
      await fireEvent.input(input, { target: { value: 'invalid' } })
      await establishInvalidState()

      expect(onValidity.mock.lastCall?.[0].value).toBe('invalid')
      expect(onValidity.mock.lastCall?.[0].validity.customError).toBe(true)
      expect(onValidity.mock.lastCall?.[0].validity.valueMissing).toBe(false)
      expect(validate).toHaveBeenCalledTimes(1)

      await fireEvent.focus(input)
      await fireEvent.input(input, { target: { value: '' } })

      expect(onValidity.mock.lastCall?.[0].value).toBe('')
      expect(onValidity.mock.lastCall?.[0].validity.customError).toBe(true)
      expect(onValidity.mock.lastCall?.[0].validity.valueMissing).toBe(true)
      expect(screen.getByText('Required')).toBeVisible()
      expect(validate).toHaveBeenCalledTimes(1)

      if (validationMode === 'onBlur') {
        await fireEvent.blur(input)
      } else {
        await fireEvent.click(screen.getByText('submit'))
      }

      expect(onValidity.mock.lastCall?.[0].value).toBe('')
      expect(onValidity.mock.lastCall?.[0].validity.customError).toBe(true)
      expect(onValidity.mock.lastCall?.[0].validity.valueMissing).toBe(true)
      expect(screen.getByText('Required')).toBeVisible()
    }
  )

  it.skipIf(isJSDOM)('defers badInput during required change revalidation', async () => {
    const { userEvent } = await import('vitest/browser')
    const user = userEvent.setup()
    const onValidity = vi.fn()
    render(DeferredBadInput, { onValidity })

    const input = screen.getByTestId('control') as HTMLInputElement

    await user.type(input, '1[Tab]')

    expect(onValidity.mock.lastCall?.[0].value).toBe('1')
    expect(onValidity.mock.lastCall?.[0].validity.customError).toBe(true)

    await user.type(input, '{Control>}a{/Control}e')

    expect(input.validity.valueMissing).toBe(true)
    expect(input.validity.badInput).toBe(true)
    expect(onValidity.mock.lastCall?.[0].value).toBe('1')
    expect(onValidity.mock.lastCall?.[0].validity.valueMissing).toBe(false)
    expect(onValidity.mock.lastCall?.[0].validity.badInput).toBe(false)
    expect(screen.queryByText('Required')).toBe(null)
    expect(screen.queryByText('Invalid number')).toBe(null)
  })

  it('passes validity data (validationMode=onSubmit — in a Form)', async () => {
    const onValidity = vi.fn()
    render(FieldValidityCapture, { onValidity, required: true, withForm: true })

    const input = screen.getByTestId('control')
    expect(onValidity.mock.lastCall?.[0].validity.valid).toBe(null)

    await fireEvent.click(screen.getByText('submit'))

    expect(onValidity.mock.lastCall?.[0].validity.valid).toBe(false)
    expect(onValidity.mock.lastCall?.[0].validity.valueMissing).toBe(true)
    expect(onValidity.mock.lastCall?.[0]).toHaveProperty('transitionStatus')

    await fireEvent.focus(input)
    await fireEvent.input(input, { target: { value: 'test' } })

    expect(onValidity.mock.lastCall?.[0].value).toBe('test')
    expect(onValidity.mock.lastCall?.[0].validity.valid).toBe(true)
    expect(onValidity.mock.lastCall?.[0].validity.valueMissing).toBe(false)
  })

  it('passes validity data (validationMode=onBlur)', async () => {
    const onValidity = vi.fn()
    render(FieldValidityCapture, { onValidity, required: true, validationMode: 'onBlur' })

    const input = screen.getByTestId('control')
    expect(onValidity.mock.lastCall?.[0].validity.valid).toBe(null)

    await fireEvent.focus(input)
    await fireEvent.input(input, { target: { value: 'test' } })
    await fireEvent.blur(input)

    expect(onValidity.mock.lastCall?.[0].value).toBe('test')
    expect(onValidity.mock.lastCall?.[0].validity.valid).toBe(true)
    expect(onValidity.mock.lastCall?.[0].validity.valueMissing).toBe(false)
  })

  it('passes errors when validate returns a string', async () => {
    const onValidity = vi.fn()
    render(FieldValidityCapture, {
      onValidity,
      validationMode: 'onBlur',
      validate: () => 'error'
    })

    const input = screen.getByTestId('control')
    await fireEvent.focus(input)
    await fireEvent.blur(input)

    expect(onValidity.mock.lastCall?.[0].error).toBe('error')
    expect(onValidity.mock.lastCall?.[0].errors).toEqual(['error'])
  })

  it('passes errors when validate returns an array of strings', async () => {
    const onValidity = vi.fn()
    render(FieldValidityCapture, {
      onValidity,
      validationMode: 'onBlur',
      validate: () => ['1', '2']
    })

    const input = screen.getByTestId('control')
    await fireEvent.focus(input)
    await fireEvent.blur(input)

    expect(onValidity.mock.lastCall?.[0].error).toBe('1')
    expect(onValidity.mock.lastCall?.[0].errors).toEqual(['1', '2'])
  })
})
