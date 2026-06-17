<script lang="ts">
  import type { PartProps } from '$lib/internal/types'

  type Props = PartProps<[], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()
</script>

<svelte:element this={as} bind:this={ref} aria-hidden="true" {...rest}>
  {#if children}
    {@render children()}
  {:else}
    ▼
  {/if}
</svelte:element>
