<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { SelectGroupContext } from './context'

  type Props = PartProps

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const group = $state({ labelId: undefined as string | undefined })
  SelectGroupContext.set(group)
</script>

<svelte:element this={as} bind:this={ref} role="group" aria-labelledby={group.labelId} {...rest}>
  {@render children?.()}
</svelte:element>
