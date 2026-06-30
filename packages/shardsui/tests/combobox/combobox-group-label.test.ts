import { render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import ComboboxWithGroups from './fixtures/combobox-with-groups.svelte'
import GroupLabelSwap from './fixtures/group-label-swap.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.GroupLabel />', () => {
  describe('a11y attributes', () => {
    it('wires to group aria-labelledby', () => {
      render(ComboboxWithGroups, { open: true })

      const group = screen.getByTestId('group-fruits')
      const label = screen.getByTestId('group-label-fruits')

      expect(group).toHaveAttribute('aria-labelledby', label.id)
    })

    it('uses a provided id in aria-labelledby', () => {
      render(ComboboxWithGroups, { open: true, groupLabelId: 'test-group' })

      expect(screen.getByTestId('group-fruits')).toHaveAttribute('aria-labelledby', 'test-group')
      expect(screen.getByTestId('group-label-fruits')).toHaveAttribute('id', 'test-group')
    })

    it('does not let an older label cleanup clear a newer label', async () => {
      const { rerender } = render(GroupLabelSwap, { labels: 'old' })
      const group = screen.getByTestId('group')

      expect(group).toHaveAttribute('aria-labelledby', 'old-label')

      await rerender({ labels: 'both' })
      expect(group).toHaveAttribute('aria-labelledby', 'new-label')

      await rerender({ labels: 'new' })
      expect(group).toHaveAttribute('aria-labelledby', 'new-label')
    })
  })
})
