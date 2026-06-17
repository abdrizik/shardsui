<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { ComboboxRowContext } from './context'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  ComboboxRowContext.set(true)
</script>

<svelte:element this={as} bind:this={ref} role="row" {...rest}>
  {@render children?.()}
</svelte:element>
