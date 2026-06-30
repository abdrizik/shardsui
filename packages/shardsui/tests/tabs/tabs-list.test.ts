import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import TabsLabelledList from './fixtures/tabs-labelled-list.svelte'
import TabsListPanels from './fixtures/tabs-list-panels.svelte'

describe('<Tabs.List />', () => {
  it('moves aria-selected as each tab is activated in turn', async () => {
    const user = userEvent.setup()
    render(TabsListPanels)

    const tab1 = screen.getByTestId('tab-0')
    const tab2 = screen.getByTestId('tab-1')
    const tab3 = screen.getByTestId('tab-2')

    expect(tab1).toHaveAttribute('aria-selected', 'true')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tab3).toHaveAttribute('aria-selected', 'false')

    await user.click(tab2)
    expect(tab1).toHaveAttribute('aria-selected', 'false')
    expect(tab2).toHaveAttribute('aria-selected', 'true')
    expect(tab3).toHaveAttribute('aria-selected', 'false')

    await user.click(tab3)
    expect(tab1).toHaveAttribute('aria-selected', 'false')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tab3).toHaveAttribute('aria-selected', 'true')

    await user.click(tab1)
    expect(tab1).toHaveAttribute('aria-selected', 'true')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tab3).toHaveAttribute('aria-selected', 'false')
  })

  describe('prop: loopFocus', () => {
    it('does not wrap focus past the first tab when loopFocus=false', async () => {
      const user = userEvent.setup()
      render(TabsListPanels, { loopFocus: false })

      const firstTab = screen.getByTestId('tab-0')
      firstTab.focus()
      await user.keyboard('{ArrowLeft}')

      expect(firstTab).toHaveFocus()
      expect(screen.getByTestId('tab-2')).not.toHaveFocus()
    })

    it('does not wrap focus past the last tab when loopFocus=false', async () => {
      const user = userEvent.setup()
      render(TabsListPanels, { loopFocus: false })

      const lastTab = screen.getByTestId('tab-2')
      lastTab.focus()
      await user.keyboard('{ArrowRight}')

      expect(lastTab).toHaveFocus()
      expect(screen.getByTestId('tab-0')).not.toHaveFocus()
    })
  })

  it('can be named via aria-label', () => {
    render(TabsLabelledList, { ariaLabel: 'string label' })
    expect(screen.getByRole('tablist')).toHaveAccessibleName('string label')
  })

  it('can be named via aria-labelledby', () => {
    render(TabsLabelledList, { ariaLabelledby: 'label-id' })
    expect(screen.getByRole('tablist')).toHaveAccessibleName('complex name')
  })
})
