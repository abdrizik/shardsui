import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import AsAccordion from './fixtures/as-accordion.svelte'
import SpanTriggerAccordion from './fixtures/span-trigger-accordion.svelte'

describe('<Accordion.Trigger />', () => {
  describe('prop: as', () => {
    it('renders a custom element', () => {
      render(AsAccordion, { triggerAs: 'span' })

      expect(screen.getByTestId('trigger').tagName.toLowerCase()).toBe('span')
    })
  })

  describe('non-native button', () => {
    it('keeps a non-native trigger tabbable (tabindex=0)', () => {
      render(SpanTriggerAccordion)

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      expect(trigger).toHaveAttribute('tabindex', '0')
    })
  })
})
