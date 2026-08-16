<script module lang="ts">
  import {
    getMaxScrollOffset,
    normalizeScrollOffset,
    SCROLL_EDGE_TOLERANCE_PX
  } from '$lib/internal/scroll-edges'
  import type { SelectItem } from './context'

  const SCROLL_STEP_MS = 40

  function scrollTopForPreviousItem(
    items: readonly SelectItem[],
    scrollTop: number,
    arrowHeight: number,
    maxScrollTop: number
  ) {
    const visibleTop = scrollTop + arrowHeight - SCROLL_EDGE_TOLERANCE_PX
    let firstVisibleIndex = 0
    for (const [i, item] of items.entries()) {
      if (item.element.offsetTop >= visibleTop) {
        firstVisibleIndex = i
        break
      }
    }
    const target = items[firstVisibleIndex - 1]
    if (!target) return 0
    return normalizeScrollOffset(target.element.offsetTop - arrowHeight, maxScrollTop)
  }

  function scrollTopForNextItem(
    items: readonly SelectItem[],
    scrollTop: number,
    clientHeight: number,
    arrowHeight: number,
    maxScrollTop: number
  ) {
    const visibleBottom = scrollTop + clientHeight - arrowHeight + SCROLL_EDGE_TOLERANCE_PX
    let lastVisibleIndex = items.length - 1
    for (const [i, item] of items.entries()) {
      if (item.element.offsetTop + item.element.offsetHeight > visibleBottom) {
        lastVisibleIndex = Math.max(0, i - 1)
        break
      }
    }
    const target = items[lastVisibleIndex + 1]
    if (!target) return maxScrollTop
    return normalizeScrollOffset(
      target.element.offsetTop + target.element.offsetHeight - clientHeight + arrowHeight,
      maxScrollTop
    )
  }
</script>

<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { chain } from '$lib/internal/chain'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { Timeout } from '$lib/internal/timeout'
  import { Transition } from '$lib/internal/transition-status.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { SelectPositionerContext, SelectContext, type SelectScrollArrowState } from './context'

  type Props = PartProps<[SelectScrollArrowState], 'div', 'onmouseleave' | 'onmousemove'> & {
    direction: 'up' | 'down'
    keepMounted?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    direction,
    keepMounted = false,
    onmousemove,
    onmouseleave,
    children,
    ...rest
  }: Props = $props()

  const select = SelectContext.get()
  const registry = select.itemRegistry
  const positioner = SelectPositionerContext.get()

  const scrollTimeout = new Timeout()
  $effect(scrollTimeout.disposeEffect)

  $effect.pre(select.registerScrollArrow)

  const isUp = $derived(direction === 'up')

  const visible = $derived(
    (isUp ? select.scrollUpArrowVisible : select.scrollDownArrowVisible) &&
      select.openMethod !== 'touch'
  )

  const transition = new Transition(() => ({ open: visible }))

  openChangeComplete(() => ({
    open: visible,
    element: ref,
    onComplete: () => {
      if (!visible) transition.mounted = false
    }
  }))

  const shouldRender = $derived(transition.mounted || keepMounted)
  const side = $derived(positioner.side)

  const selectState = $derived({
    direction,
    visible,
    side,
    transitionStatus: transition.status
  })

  const stateAttrs = $derived(
    dataAttrs({
      direction,
      visible,
      'starting-style': transition.status === 'starting',
      'ending-style': transition.status === 'ending',
      side
    })
  )

  function scrollNextItem() {
    const scroller = select.scroller
    if (!scroller) return

    registry.highlightedIndex = -1

    const maxScrollTop = getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight)
    const scrollTop = normalizeScrollOffset(scroller.scrollTop, maxScrollTop)

    scroller.scrollTop = scrollTop

    if (scrollTop === (isUp ? 0 : maxScrollTop)) {
      scrollTimeout.clear()
      return
    }

    const items = registry.items
    if (items.length > 0) {
      const arrowHeight = ref?.offsetHeight || 0
      scroller.scrollTop = isUp
        ? scrollTopForPreviousItem(items, scrollTop, arrowHeight, maxScrollTop)
        : scrollTopForNextItem(items, scrollTop, scroller.clientHeight, arrowHeight, maxScrollTop)
    }

    scrollTimeout.start(SCROLL_STEP_MS, scrollNextItem)
  }

  function startScrollingOnHover(event: MouseEvent) {
    if (event.movementX === 0 && event.movementY === 0) return
    if (scrollTimeout.isStarted()) return
    registry.highlightedIndex = -1
    scrollTimeout.start(SCROLL_STEP_MS, scrollNextItem)
  }

  function stopScrolling() {
    scrollTimeout.clear()
  }
</script>

{#if shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...stateAttrs}
    style={mergeStyle('position:absolute', style)}
    aria-hidden="true"
    onmousemove={chain(onmousemove, startScrollingOnHover)}
    onmouseleave={chain(onmouseleave, stopScrolling)}
    {...rest}
  >
    {#if children}{@render children(selectState)}{:else}{isUp ? '▲' : '▼'}{/if}
  </svelte:element>
{/if}
