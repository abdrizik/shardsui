import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicMeter from './fixtures/basic-meter.svelte'

describe('<Meter.Track />', () => {
  it('renders a custom as element', () => {
    render(BasicMeter, { trackAs: 'nav' })
    expect(screen.getByTestId('track').tagName.toLowerCase()).toBe('nav')
  })
})
