import { Collapsible } from '$lib/components/collapsible'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import AsCollapsible from './fixtures/as-collapsible.svelte'
import BasicCollapsible from './fixtures/basic-collapsible.svelte'
import CustomIdCollapsible from './fixtures/custom-id-collapsible.svelte'

describe('<Collapsible.Trigger />', () => {
  it('throws when rendered outside a Collapsible.Root', () => {
    expect(() => render(Collapsible.Trigger)).toThrow(
      'ShardsUI: this part must be rendered inside <Collapsible.Root>.'
    )
  })

  describe('prop: as', () => {
    it('renders a custom element', () => {
      render(AsCollapsible, { triggerAs: 'span' })

      const trigger = screen.getByTestId('trigger')
      expect(trigger.tagName.toLowerCase()).toBe('span')
      expect(trigger).toHaveAttribute('role', 'button')
      expect(trigger).toHaveAttribute('tabindex', '0')
    })
  })

  it('forwards the id prop', () => {
    render(CustomIdCollapsible, { triggerId: 'custom-trigger-id' })

    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute(
      'id',
      'custom-trigger-id'
    )
  })

  describe('prop: onclick', () => {
    it('runs the onclick prop and toggles the panel', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(BasicCollapsible, { onTriggerClick: handleClick })

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      expect(handleClick).toHaveBeenCalledTimes(1)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })
})
