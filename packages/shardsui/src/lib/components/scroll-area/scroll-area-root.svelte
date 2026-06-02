<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { chain } from '$lib/internal/chain'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { mergeStyle } from '$lib/internal/merge-style'
  import {
    ScrollAreaRoot,
    type OverflowEdgeThreshold,
    type ScrollAreaRootState
  } from './scroll-area.svelte'
  import { ScrollAreaContext } from './context'

  type Props = PartProps<[ScrollAreaRootState]> & {
    overflowEdgeThreshold?: number | Partial<OverflowEdgeThreshold>
  }

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    overflowEdgeThreshold,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const direction = DirectionContext.get()

  const scrollArea = new ScrollAreaRoot(() => ({
    overflowEdgeThreshold,
    direction: direction.direction
  }))

  ScrollAreaContext.set(scrollArea)

  const mergedStyle = $derived(
    mergeStyle(
      `position: relative; --scroll-area-corner-width: ${scrollArea.cornerSize.width}px; --scroll-area-corner-height: ${scrollArea.cornerSize.height}px`,
      style
    )
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...scrollArea.stateAttrs}
  role="presentation"
  style={mergedStyle}
  onpointerenter={chain(onpointerenter, scrollArea.markHovering)}
  onpointermove={chain(onpointermove, scrollArea.markHovering)}
  onpointerleave={chain(onpointerleave, scrollArea.clearHovering)}
  onpointerdown={chain(onpointerdown, scrollArea.markTouchModality)}
  {...rest}
>
  {@render children?.(scrollArea.state)}
</svelte:element>
