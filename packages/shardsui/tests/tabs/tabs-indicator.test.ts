import { getCssDimensions } from '$lib/internal/get-css-dimensions'
import { render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import IndicatorMissing from './fixtures/indicator-missing.svelte'
import IndicatorNull from './fixtures/indicator-null.svelte'
import IndicatorTabs from './fixtures/indicator-tabs.svelte'
import InsertedIndicatorTabs from './fixtures/inserted-indicator-tabs.svelte'
import MultiIndicatorTabs from './fixtures/multi-indicator-tabs.svelte'
import ScaledIndicatorTabs from './fixtures/scaled-indicator-tabs.svelte'
import TransformedIndicatorTabs from './fixtures/transformed-indicator-tabs.svelte'

describe('<Tabs.Indicator />', () => {
  it('exposes null active tab state when the selected value has no matching tab', async () => {
    render(IndicatorMissing)

    await waitFor(() => {
      expect(screen.getByTestId('bubble')).toHaveAttribute('hidden')
    })

    const state = screen.getByTestId('indicator-state')
    expect(state).toHaveAttribute('data-active-tab-position', 'null')
    expect(state).toHaveAttribute('data-active-tab-size', 'null')
  })

  describe.skipIf(isJSDOM)('rendering', () => {
    it('does not render when no tab is active (value=null)', () => {
      render(IndicatorNull)
      expect(screen.queryByTestId('bubble')).toBe(null)
    })
  })

  describe.skipIf(isJSDOM)('position variables', () => {
    function assertSize(actual: string, expected: number) {
      expect(Math.abs(parseFloat(actual) - expected)).toBeLessThanOrEqual(0.01)
    }

    function assertBubblePositionVariables(
      bubble: HTMLElement,
      tabList: HTMLElement,
      activeTab: HTMLElement
    ) {
      const tabRect = activeTab.getBoundingClientRect()
      const tabListRect = tabList.getBoundingClientRect()
      const { width: tabWidth, height: tabHeight } = getCssDimensions(activeTab)
      const { width: tabListWidth, height: tabListHeight } = getCssDimensions(tabList)
      const scaleX = tabListWidth > 0 ? tabListRect.width / tabListWidth : 1
      const scaleY = tabListHeight > 0 ? tabListRect.height / tabListHeight : 1

      const relativeLeft =
        (tabRect.left - tabListRect.left) / scaleX + tabList.scrollLeft - tabList.clientLeft
      const relativeTop =
        (tabRect.top - tabListRect.top) / scaleY + tabList.scrollTop - tabList.clientTop
      const relativeRight = tabList.scrollWidth - relativeLeft - tabWidth
      const relativeBottom = tabList.scrollHeight - relativeTop - tabHeight

      const style = window.getComputedStyle(bubble)

      assertSize(style.getPropertyValue('--active-tab-left'), relativeLeft)
      assertSize(style.getPropertyValue('--active-tab-right'), relativeRight)
      assertSize(style.getPropertyValue('--active-tab-top'), relativeTop)
      assertSize(style.getPropertyValue('--active-tab-bottom'), relativeBottom)
      assertSize(style.getPropertyValue('--active-tab-width'), tabWidth)
      assertSize(style.getPropertyValue('--active-tab-height'), tabHeight)
    }

    it('sets CSS variables corresponding to the active tab', async () => {
      render(IndicatorTabs, { value: 2 })

      const bubble = screen.getByTestId('bubble')
      const tabList = screen.getByRole('tablist')
      const activeTab = screen.getAllByRole('tab')[1]

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))
    })

    it('updates the position variables when the active tab changes', async () => {
      const { rerender } = render(IndicatorTabs, { value: 2 })

      const bubble = screen.getByTestId('bubble')
      const tabList = screen.getByRole('tablist')
      const tabs = screen.getAllByRole('tab')

      await rerender({ value: 3 })
      await waitFor(() => assertBubblePositionVariables(bubble, tabList, tabs[2]))

      await rerender({ value: 1 })
      await waitFor(() => assertBubblePositionVariables(bubble, tabList, tabs[0]))
    })

    it('updates the position variables when the tab list is resized', async () => {
      const { rerender } = render(IndicatorTabs, {
        value: 1,
        rootStyle: 'width: 400px',
        listStyle: 'display: flex',
        tabStyle: 'flex: 1 1 auto'
      })

      const bubble = screen.getByTestId('bubble')
      const tabList = screen.getByRole('tablist')
      const activeTab = screen.getAllByRole('tab')[0]

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))

      await rerender({
        value: 1,
        rootStyle: 'width: 800px',
        listStyle: 'display: flex',
        tabStyle: 'flex: 1 1 auto'
      })

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))
    })

    it('accounts for scroll and border when the tab list is transformed', async () => {
      render(TransformedIndicatorTabs)

      const bubble = screen.getByTestId('bubble')
      const tabList = screen.getByTestId('tab-list')
      const activeTab = screen.getAllByRole('tab')[2]

      tabList.scrollLeft = 80

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))
    })

    it('updates position when a different tab resizes', async () => {
      render(IndicatorTabs, {
        value: 2,
        listStyle: 'width: 300px; display: flex; overflow: hidden',
        tabStyle: 'width: 100px; flex-shrink: 0'
      })

      const bubble = screen.getByTestId('bubble')
      const tabList = screen.getByTestId('tab-list')
      const firstTab = screen.getByTestId('first-tab')
      const activeTab = screen.getAllByRole('tab')[1]

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))

      firstTab.setAttribute('style', 'width: 140px; flex-shrink: 0;')

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))
    })

    it('keeps observing a tab whose rendered element type changes', async () => {
      const { rerender } = render(IndicatorTabs, {
        value: 2,
        listStyle: 'width: 300px; display: flex; overflow: hidden',
        tabStyle: 'width: 100px; flex-shrink: 0'
      })

      const bubble = screen.getByTestId('bubble')
      const tabList = screen.getByTestId('tab-list')
      const activeTab = screen.getAllByRole('tab')[1]

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))

      await rerender({
        value: 2,
        listStyle: 'width: 300px; display: flex; overflow: hidden',
        tabStyle: 'width: 100px; flex-shrink: 0',
        firstTabAs: 'a'
      })

      const swappedTab = screen.getByTestId('first-tab')
      expect(swappedTab.tagName).toBe('A')

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

      swappedTab.setAttribute('style', 'width: 160px; flex-shrink: 0;')

      await waitFor(() => assertBubblePositionVariables(bubble, tabList, activeTab))
    })

    it('falls back to offset positions when the tab list is scaled to zero', async () => {
      render(ScaledIndicatorTabs)

      const bubble = screen.getByTestId('bubble')
      const activeTab = screen.getAllByRole('tab')[1]

      await waitFor(() => {
        assertSize(
          window.getComputedStyle(bubble).getPropertyValue('--active-tab-left'),
          activeTab.offsetLeft
        )
      })

      const style = window.getComputedStyle(bubble)
      assertSize(style.getPropertyValue('--active-tab-top'), activeTab.offsetTop)
      assertSize(style.getPropertyValue('--active-tab-width'), 100)
      expect(bubble).not.toHaveAttribute('hidden')
    })

    it('updates position when a new tab is inserted and then resized', async () => {
      const { rerender } = render(InsertedIndicatorTabs, { insertedTabWidth: null })

      const bubble = screen.getByTestId('bubble')
      const tabList = screen.getByTestId('tab-list')

      await waitFor(() =>
        assertBubblePositionVariables(bubble, tabList, screen.getAllByRole('tab')[1])
      )

      await rerender({ insertedTabWidth: 60 })

      await waitFor(() =>
        assertBubblePositionVariables(bubble, tabList, screen.getAllByRole('tab')[2])
      )

      screen.getByTestId('inserted-tab').setAttribute('style', 'width: 120px; flex-shrink: 0;')

      await waitFor(() =>
        assertBubblePositionVariables(bubble, tabList, screen.getAllByRole('tab')[2])
      )
    })

    it('updates all indicators when a different tab resizes', async () => {
      render(MultiIndicatorTabs)

      const tabList = screen.getByTestId('tab-list')
      const firstTab = screen.getByTestId('first-tab')
      const activeTab = screen.getAllByRole('tab')[1]

      await waitFor(() => {
        assertBubblePositionVariables(screen.getByTestId('bubble'), tabList, activeTab)
        assertBubblePositionVariables(screen.getByTestId('second-bubble'), tabList, activeTab)
      })

      firstTab.setAttribute('style', 'width: 140px; flex-shrink: 0;')

      await waitFor(() => {
        assertBubblePositionVariables(screen.getByTestId('bubble'), tabList, activeTab)
        assertBubblePositionVariables(screen.getByTestId('second-bubble'), tabList, activeTab)
      })
    })
  })
})
