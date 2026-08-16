<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import {
    ScrollAreaContext,
    ScrollAreaScrollbarContext,
    type ScrollAreaThumbState
  } from './context'

  type Props = PartProps<
    [ScrollAreaThumbState],
    'div',
    'onpointercancel' | 'onpointerdown' | 'onpointermove' | 'onpointerup'
  >

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    onpointerdown,
    onpointermove,
    onpointerup,
    onpointercancel,
    children,
    ...rest
  }: Props = $props()

  const scrollArea = ScrollAreaContext.get()
  const scrollbar = ScrollAreaScrollbarContext.get()

  const vertical = $derived(scrollbar.orientation === 'vertical')
  const scrolling = $derived(vertical ? scrollArea.scrollingY : scrollArea.scrollingX)

  const scrollAreaState: ScrollAreaThumbState = $derived({
    scrolling,
    orientation: scrollbar.orientation
  })

  const stateAttrs = $derived(dataAttrs({ scrolling, orientation: scrollbar.orientation }))

  const attachThumb = $derived(
    vertical
      ? attachElement((el) => (scrollArea.thumbYElement = el))
      : attachElement((el) => (scrollArea.thumbXElement = el))
  )

  function startDrag(event: PointerEvent) {
    scrollArea.startThumbDrag(event, scrollbar.orientation)
  }
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachThumb}
  {style}
  style:visibility={scrollArea.hasMeasured ? undefined : 'hidden'}
  style:height={vertical ? 'var(--scroll-area-thumb-height)' : undefined}
  style:width={vertical ? undefined : 'var(--scroll-area-thumb-width)'}
  onpointerdown={chain(onpointerdown, startDrag)}
  onpointermove={chain(onpointermove, scrollArea.dragThumb)}
  onpointerup={chain(onpointerup, scrollArea.endThumbDrag)}
  onpointercancel={chain(onpointercancel, scrollArea.endThumbDrag)}
  {...rest}
>
  {@render children?.(scrollAreaState)}
</svelte:element>
