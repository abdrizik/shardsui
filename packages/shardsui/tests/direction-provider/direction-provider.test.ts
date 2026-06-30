import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicDirectionProvider from './fixtures/basic-direction-provider.svelte'
import DirectionProbe from './fixtures/direction-probe.svelte'

describe('<DirectionProvider />', () => {
  it('defaults getDirection to ltr outside a provider', () => {
    render(DirectionProbe)

    expect(screen.getByTestId('direction')).toHaveTextContent('ltr')
  })

  it('provides the configured direction to descendants', async () => {
    const { rerender } = render(BasicDirectionProvider, { direction: 'rtl' })

    expect(screen.getByTestId('direction')).toHaveTextContent('rtl')

    await rerender({ direction: 'ltr' })

    expect(screen.getByTestId('direction')).toHaveTextContent('ltr')
  })
})
