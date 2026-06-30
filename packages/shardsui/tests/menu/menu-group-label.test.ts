import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import GroupLabelOutsideGroup from './fixtures/group-label-outside-group.svelte'
import GroupProvidedLabel from './fixtures/group-provided-label.svelte'
import MenuWithGroups from './fixtures/menu-with-groups.svelte'
import MenuWithRadioItems from './fixtures/menu-with-radio-items.svelte'
import RadioGroupProvidedLabel from './fixtures/radio-group-provided-label.svelte'
import SwappableGroupLabel from './fixtures/swappable-group-label.svelte'

describe('<Menu.GroupLabel />', () => {
  it('throws when rendered outside <Menu.Group> or <Menu.RadioGroup>', () => {
    expect(() => render(GroupLabelOutsideGroup)).toThrow(
      'ShardsUI: this part must be rendered inside <Menu.Group>.'
    )
  })

  describe('a11y attributes', () => {
    it('has the role presentation', async () => {
      const user = userEvent.setup()
      render(MenuWithGroups)
      await user.click(screen.getByRole('button', { name: 'Open' }))

      expect(screen.getByTestId('group-label-1')).toHaveAttribute('role', 'presentation')
    })

    it("references the generated id in Group's aria-labelledby", async () => {
      const user = userEvent.setup()
      render(MenuWithGroups)
      await user.click(screen.getByRole('button', { name: 'Open' }))

      const label = screen.getByTestId('group-label-1')
      expect(label.id).toBeTruthy()
      expect(screen.getByTestId('group-1')).toHaveAttribute('aria-labelledby', label.id)
    })

    it("references the provided id in Group's aria-labelledby", () => {
      render(GroupProvidedLabel)

      expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'test-group')
    })

    it("references the generated id in RadioGroup's aria-labelledby", async () => {
      const user = userEvent.setup()
      render(MenuWithRadioItems)
      await user.click(screen.getByRole('button', { name: 'Open' }))

      const label = screen.getByTestId('radio-group-label')
      expect(label.id).toBeTruthy()
      expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', label.id)
    })

    it("references the provided id in RadioGroup's aria-labelledby", () => {
      render(RadioGroupProvidedLabel)

      expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'test-group')
    })

    it('does not let an older label cleanup clear a newer label', async () => {
      const { rerender } = render(SwappableGroupLabel, { labels: 'old' })

      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-labelledby', 'old-label')

      await rerender({ labels: 'both' })
      expect(group).toHaveAttribute('aria-labelledby', 'new-label')

      await rerender({ labels: 'new' })
      expect(group).toHaveAttribute('aria-labelledby', 'new-label')
    })
  })
})
