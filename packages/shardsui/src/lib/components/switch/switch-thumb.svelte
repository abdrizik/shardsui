<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { SwitchContext, type SwitchState } from './context'

  type Props = PartProps<[SwitchState], 'span'>

  let { as = 'span', ref = $bindable(null), children, ...rest }: Props = $props()

  const switchRoot = SwitchContext.get()
</script>

<svelte:element this={as} bind:this={ref} {...switchRoot.stateAttrs} {...rest}>
  {@render children?.(switchRoot.state)}
</svelte:element>
