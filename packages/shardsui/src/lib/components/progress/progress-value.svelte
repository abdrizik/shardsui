<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { ProgressContext } from './context'

  type Props = PartProps<[string, number | null], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()

  const progress = ProgressContext.get()

  const indeterminate = $derived(progress.status === 'indeterminate')
</script>

<svelte:element this={as} bind:this={ref} {...progress.stateAttrs} aria-hidden="true" {...rest}>
  {#if children}
    {@render children(indeterminate ? 'indeterminate' : progress.formattedValue, progress.value)}
  {:else if !indeterminate}
    {progress.formattedValue}
  {/if}
</svelte:element>
