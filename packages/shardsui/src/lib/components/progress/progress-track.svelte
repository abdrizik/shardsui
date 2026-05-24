<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { ProgressContext } from './context'
  import type { ProgressState } from './progress.svelte'

  type Props = PartProps<[ProgressState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const progress = ProgressContext.get()
</script>

<svelte:element this={as} bind:this={ref} {...progress.stateAttrs} {...rest}>
  {@render children?.(progress.state)}
</svelte:element>
