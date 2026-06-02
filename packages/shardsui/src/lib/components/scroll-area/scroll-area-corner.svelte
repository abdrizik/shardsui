<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { attachElement } from '$lib/internal/attach-element'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { ScrollAreaContext } from './context'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const scrollArea = ScrollAreaContext.get()

  const attachCorner = attachElement<HTMLElement>((node) => (scrollArea.cornerElement = node))

  const mergedStyle = $derived(
    mergeStyle(
      'position: absolute; bottom: 0; inset-inline-end: 0; width: var(--scroll-area-corner-width); height: var(--scroll-area-corner-height)',
      style
    )
  )
</script>

{#if !scrollArea.hiddenScrollbars.corner}
  <svelte:element this={as} bind:this={ref} {@attach attachCorner} style={mergedStyle} {...rest}>
    {@render children?.()}
  </svelte:element>
{/if}
