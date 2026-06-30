import { Dialog } from '$lib/components/dialog'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import DisabledTriggerCustomElement from './fixtures/disabled-trigger-custom-element.svelte'
import DisabledTrigger from './fixtures/disabled-trigger.svelte'

describe('<Dialog.Trigger />', () => {
  it('throws a descriptive error without a root or handle', () => {
    expect(() => render(Dialog.Trigger)).toThrow(
      'ShardsUI: this part must be rendered inside <Dialog.Root>.'
    )
  })

  it('disabled trigger does not open the dialog and is not Tab-focusable', async () => {
    const user = userEvent.setup()
    render(DisabledTrigger)

    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveAttribute('disabled')
    expect(trigger).toHaveAttribute('data-disabled')

    await user.click(trigger)
    expect(screen.queryByText('title text')).toBe(null)

    await user.keyboard('[Tab]')
    expect(document.activeElement).not.toBe(trigger)
  })

  it('disabled non-button trigger uses aria-disabled and does not open the dialog', async () => {
    const user = userEvent.setup()
    render(DisabledTriggerCustomElement)

    const trigger = screen.getByRole('button')
    expect(trigger).not.toHaveAttribute('disabled')
    expect(trigger).toHaveAttribute('data-disabled')
    expect(trigger).toHaveAttribute('aria-disabled', 'true')

    await user.click(trigger)
    expect(screen.queryByText('title text')).toBe(null)

    await user.keyboard('[Tab]')
    expect(document.activeElement).not.toBe(trigger)
  })
})
