<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import type { AccordionItemState } from './accordion.svelte'
  import { AccordionItemContext } from './context'

  type Props = PartProps<[AccordionItemState], 'h3'>

  let { as = 'h3', ref = $bindable(null), children, ...rest }: Props = $props()

  const item = AccordionItemContext.get()
</script>

<svelte:element this={as} bind:this={ref} {...item.stateAttrs} {...rest}>
  {@render children?.(item.state)}
</svelte:element>
