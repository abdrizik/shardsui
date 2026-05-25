<script lang="ts">
  import type { PartProps } from '$lib/internal/types'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()
</script>

<svelte:element this={as} bind:this={ref} {...rest}>
  {@render children?.()}
</svelte:element>
