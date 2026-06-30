import { Radio } from '$lib/components/radio'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isGecko, isWebKit } from '../test-utils'
import ArrowKeyPropagationRadio from './fixtures/arrow-key-propagation-radio.svelte'
import BasicRadio from './fixtures/basic-radio.svelte'
import ButtonRadio from './fixtures/button-radio.svelte'
import ClickPropagationRadio from './fixtures/click-propagation-radio.svelte'
import NullValueRadio from './fixtures/null-value-radio.svelte'
import RefusedSelectionRadio from './fixtures/refused-selection-radio.svelte'
import SiblingLabelRadio from './fixtures/sibling-label-radio.svelte'
import UndefinedValueRadio from './fixtures/undefined-value-radio.svelte'

describe('<Radio.Root />', () => {
  describe('prop: onclick', () => {
    it.each(['span', 'button'] as const)(
      'propagates a single click to ancestors (%s)',
      async (as) => {
        const onParentClick = vi.fn()
        render(ClickPropagationRadio, { as, onParentClick })

        await fireEvent.click(screen.getByTestId('radio'))

        expect(onParentClick).toHaveBeenCalledTimes(1)
        expect(screen.getByTestId('radio')).toHaveAttribute('aria-checked', 'true')
      }
    )

    it.each(['span', 'button'] as const)(
      'does not propagate to ancestors when stopPropagation() is called (%s)',
      async (as) => {
        const onParentClick = vi.fn()
        render(ClickPropagationRadio, {
          as,
          onParentClick,
          onclick: (event: MouseEvent) => event.stopPropagation()
        })

        await fireEvent.click(screen.getByTestId('radio'))

        expect(onParentClick).toHaveBeenCalledTimes(0)
        expect(screen.getByTestId('radio')).toHaveAttribute('aria-checked', 'true')
      }
    )

    it('does not propagate a click to ancestors when selecting with arrow keys', async () => {
      const user = userEvent.setup()
      const onParentClick = vi.fn()
      render(ArrowKeyPropagationRadio, { onParentClick })

      await user.click(screen.getByTestId('radio-a'))
      onParentClick.mockClear()

      await user.keyboard('{ArrowDown}')

      expect(screen.getByTestId('radio-b')).toHaveAttribute('aria-checked', 'true')
      expect(onParentClick).toHaveBeenCalledTimes(0)
    })

    it('does not select when the consumer handler calls preventDefault', async () => {
      render(BasicRadio, { onclick: (event: MouseEvent) => event.preventDefault() })

      await fireEvent.click(screen.getByTestId('radio-a'))

      expect(screen.getByTestId('radio-a')).toHaveAttribute('aria-checked', 'false')
    })
  })

  it('does not forward the value prop as an HTML attribute', () => {
    render(Radio.Root, { value: 'test', 'data-testid': 'radio' })
    expect(screen.getByTestId('radio')).not.toHaveAttribute('value')
  })

  describe('prop: as', () => {
    it.each(['span', 'button'] as const)('renders a <%s>', (as) => {
      render(Radio.Root, { value: 'a', as, 'data-testid': 'radio' })

      expect(screen.getByTestId('radio').tagName.toLowerCase()).toBe(as)
    })
  })

  describe('prop: disabled', () => {
    it('uses aria-disabled instead of HTML disabled', () => {
      render(BasicRadio, { disabled: true })
      const radio = screen.getByTestId('radio-a')
      expect(radio).not.toHaveAttribute('disabled')
      expect(radio).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('as="button"', () => {
    it('associates id with the root — not the hidden input', async () => {
      render(ButtonRadio)

      const radioA = screen.getByTestId('a')
      expect(radioA).toHaveAttribute('id', 'myRadio')

      const hiddenInput = radioA.nextElementSibling as HTMLInputElement | null
      expect(hiddenInput?.tagName).toBe('INPUT')
      expect(hiddenInput).not.toHaveAttribute('id', 'myRadio')

      expect(radioA).toHaveAttribute('aria-checked', 'false')
      await fireEvent.click(screen.getByTestId('label'))
      expect(radioA).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('aria-labelledby from sibling label', () => {
    it('sets aria-labelledby from a sibling label associated with the hidden input', () => {
      render(SiblingLabelRadio)
      const label = screen.getByText('Label A')
      expect(label.id).not.toBe('')
      expect(screen.getByRole('radio')).toHaveAttribute('aria-labelledby', label.id)
    })

    it.skipIf(isGecko || isWebKit)(
      'updates fallback aria-labelledby when the hidden input id changes',
      async () => {
        const { rerender } = render(SiblingLabelRadio, { id: 'radio-input' })
        const radio = screen.getByRole('radio')
        const labelA = screen.getByText('Label A')
        expect(labelA.id).not.toBe('')
        expect(radio).toHaveAttribute('aria-labelledby', labelA.id)

        await rerender({ id: 'radio-input-b' })

        await waitFor(() => {
          const labelB = screen.getByText('Label B')
          expect(labelB.id).not.toBe('')
          expect(labelA.id).not.toBe(labelB.id)
          expect(radio).toHaveAttribute('aria-labelledby', labelB.id)
        })
      }
    )
  })

  describe('refused selection', () => {
    const hiddenInputs = () =>
      Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]'))

    it('keeps the checked hidden input checked when a read-only radio is activated by a label', async () => {
      render(RefusedSelectionRadio, { readOnly: true })
      const [inputA, inputB] = hiddenInputs()
      expect(inputA.checked).toBe(true)

      await fireEvent.click(screen.getByTestId('label-b'))

      expect(inputB.checked).toBe(false)
      expect(inputA.checked).toBe(true)
      expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')
    })

    it('keeps the checked hidden input checked when the value setter rejects', async () => {
      render(RefusedSelectionRadio, { cancel: true })
      const [inputA, inputB] = hiddenInputs()
      expect(inputA.checked).toBe(true)

      await fireEvent.click(screen.getByTestId('b'))

      expect(inputB.checked).toBe(false)
      expect(inputA.checked).toBe(true)
      expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')
    })
  })

  it('restores the hidden inputs when a radio without a value is activated', async () => {
    render(UndefinedValueRadio, {})
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
    const [inputUndefined, inputA] = inputs

    await fireEvent.click(screen.getByTestId('radio-a'))
    expect(inputA.checked).toBe(true)

    await fireEvent.click(screen.getByTestId('radio-undefined'))

    expect(screen.getByTestId('radio-undefined')).toHaveAttribute('aria-checked', 'false')
    expect(inputUndefined.checked).toBe(false)
    expect(inputA.checked).toBe(true)
  })

  it('allows null value — clicking radio with value=null makes it checked', async () => {
    render(NullValueRadio, {})
    const radioNull = screen.getByTestId('radio-null')
    const radioA = screen.getByTestId('radio-a')
    await fireEvent.click(radioNull)
    expect(radioNull).toHaveAttribute('aria-checked', 'true')
    await fireEvent.click(radioA)
    expect(radioNull).toHaveAttribute('aria-checked', 'false')
  })
})
