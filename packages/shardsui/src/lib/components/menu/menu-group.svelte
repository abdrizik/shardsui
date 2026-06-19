<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { MenuGroupContext } from './context'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const group = $state({ labelId: undefined as string | undefined })
  MenuGroupContext.set(group)
</script>

<svelte:element this={as} bind:this={ref} role="group" aria-labelledby={group.labelId} {...rest}>
  {@render children?.()}
</svelte:element>
