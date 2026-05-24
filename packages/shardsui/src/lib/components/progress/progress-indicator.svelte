<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { ProgressContext } from './context'
  import type { ProgressState } from './progress.svelte'

  type Props = PartProps<[ProgressState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const progress = ProgressContext.get()

  const indicatorStyle = $derived(
    mergeStyle(
      progress.percentageValue != null &&
        `inset-inline-start:0;height:inherit;width:${progress.percentageValue}%`,
      style
    )
  )
</script>

<svelte:element this={as} bind:this={ref} {...progress.stateAttrs} style={indicatorStyle} {...rest}>
  {@render children?.(progress.state)}
</svelte:element>
