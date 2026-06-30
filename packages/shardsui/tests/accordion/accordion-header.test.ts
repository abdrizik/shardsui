import { Accordion } from '$lib/components/accordion'
import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import AsAccordion from './fixtures/as-accordion.svelte'

describe('<Accordion.Header />', () => {
  it('throws when rendered outside an Accordion.Item', () => {
    expect(() => render(Accordion.Header)).toThrow(
      'ShardsUI: this part must be rendered inside <Accordion.Item>.'
    )
  })

  describe('prop: as', () => {
    it('renders a custom element', () => {
      render(AsAccordion, { headerAs: 'h2' })

      expect(screen.getByTestId('header').tagName.toLowerCase()).toBe('h2')
    })
  })
})
