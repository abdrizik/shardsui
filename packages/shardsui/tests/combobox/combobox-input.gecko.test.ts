import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import RtlInputCombobox from './fixtures/rtl-input-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false,
    isGecko: true
  }
})

describe('<Combobox.Input /> in Gecko RTL', () => {
  it('uses Gecko RTL caret positions for Home and End', async () => {
    const user = userEvent.setup()
    render(RtlInputCombobox)

    const input = screen.getByTestId('input') as HTMLInputElement
    input.focus()

    await user.keyboard('{Home}')
    expect(input.selectionStart).toBe(input.value.length)

    await user.keyboard('{End}')
    expect(input.selectionStart).toBe(0)
  })
})
