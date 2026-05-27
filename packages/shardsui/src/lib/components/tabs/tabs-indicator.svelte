<script lang="ts" module>
  import { getCssDimensions } from '$lib/internal/get-css-dimensions'
  import type { TabPosition, TabSize } from './context'

  type TabGeometry = TabPosition & TabSize

  function measureTab(tabElement: HTMLElement, listElement: HTMLElement): TabGeometry {
    const { width, height } = getCssDimensions(tabElement)
    const { width: listWidth, height: listHeight } = getCssDimensions(listElement)
    const tabRect = tabElement.getBoundingClientRect()
    const listRect = listElement.getBoundingClientRect()
    const scaleX = listWidth > 0 ? listRect.width / listWidth : 1
    const scaleY = listHeight > 0 ? listRect.height / listHeight : 1
    const hasNonZeroScale = scaleX > Number.EPSILON && scaleY > Number.EPSILON

    let left: number
    let top: number

    if (hasNonZeroScale) {
      left =
        (tabRect.left - listRect.left) / scaleX + listElement.scrollLeft - listElement.clientLeft
      top = (tabRect.top - listRect.top) / scaleY + listElement.scrollTop - listElement.clientTop
    } else {
      left = tabElement.offsetLeft
      top = tabElement.offsetTop
    }

    return {
      left,
      top,
      width,
      height,
      right: listElement.scrollWidth - left - width,
      bottom: listElement.scrollHeight - top - height
    }
  }
</script>

<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { TabsListContext, TabsContext, type TabsIndicatorState } from './context'

  type Props = PartProps<[TabsIndicatorState], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()

  const tabs = TabsContext.get()
  const list = TabsListContext.get()
  let geometry = $state.raw<TabGeometry | null>(null)

  $effect(() => {
    void list.resizeVersion
    const listElement = list.element
    const tabElement = tabs.getTabElementByValue(tabs.value)
    geometry = listElement && tabElement ? measureTab(tabElement, listElement) : null
  })

  const isVisible = $derived(geometry != null && geometry.width > 0 && geometry.height > 0)

  const tabsState: TabsIndicatorState = $derived({
    ...tabs.state,
    activeTabPosition: geometry && {
      left: geometry.left,
      right: geometry.right,
      top: geometry.top,
      bottom: geometry.bottom
    },
    activeTabSize: geometry && { width: geometry.width, height: geometry.height }
  })
</script>

{#if tabs.value != null}
  <svelte:element
    this={as}
    bind:this={ref}
    {...tabs.stateAttrs}
    hidden={!isVisible}
    style:--active-tab-left={geometry ? `${geometry.left}px` : undefined}
    style:--active-tab-right={geometry ? `${geometry.right}px` : undefined}
    style:--active-tab-top={geometry ? `${geometry.top}px` : undefined}
    style:--active-tab-bottom={geometry ? `${geometry.bottom}px` : undefined}
    style:--active-tab-width={geometry ? `${geometry.width}px` : undefined}
    style:--active-tab-height={geometry ? `${geometry.height}px` : undefined}
    role="presentation"
    {...rest}
  >
    {@render children?.(tabsState)}
  </svelte:element>
{/if}
