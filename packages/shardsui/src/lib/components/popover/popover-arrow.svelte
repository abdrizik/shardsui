<script lang="ts">
  import type { AnchoredArrowState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import { PopoverPositionerContext, PopoverContext } from './context'
  import PositionerArrow from '$lib/internal/positioner-arrow.svelte'

  type Props = PartProps<[AnchoredArrowState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const popover = PopoverContext.get()
  const positioner = PopoverPositionerContext.get()
</script>

<PositionerArrow {positioner} bind:ref {as} {children} open={popover.open} {...rest} />
