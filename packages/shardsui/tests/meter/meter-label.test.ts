import { Meter } from '$lib/components/meter'
import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicMeter from './fixtures/basic-meter.svelte'

describe('<Meter.Label />', () => {
  it('renders a custom as element', () => {
    render(BasicMeter, { label: 'Usage', labelAs: 'div' })
    expect(screen.getByText('Usage').tagName.toLowerCase()).toBe('div')
  })

  it('updates and clears the meter label association', async () => {
    const { rerender } = render(BasicMeter, { label: 'Battery level', labelId: 'label-a' })

    const meter = screen.getByRole('meter')
    expect(meter).toHaveAttribute('aria-labelledby', 'label-a')

    await rerender({ labelId: 'label-b' })
    expect(meter).toHaveAttribute('aria-labelledby', 'label-b')

    await rerender({ label: undefined })
    expect(meter).not.toHaveAttribute('aria-labelledby')
  })

  it('throws a descriptive error when rendered outside Meter.Root', () => {
    expect(() => render(Meter.Label)).toThrow(
      'ShardsUI: this part must be rendered inside <Meter.Root>.'
    )
  })
})
