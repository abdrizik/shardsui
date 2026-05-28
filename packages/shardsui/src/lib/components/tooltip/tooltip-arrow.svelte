<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { TooltipPositionerContext, TooltipContext, type TooltipArrowState } from './context'
  import PositionerArrow from '$lib/internal/positioner-arrow.svelte'

  type Props = PartProps<[TooltipArrowState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const tooltip = TooltipContext.get()
  const positioner = TooltipPositionerContext.get()
</script>

<PositionerArrow
  {positioner}
  bind:ref
  {as}
  {children}
  open={tooltip.open}
  instant={tooltip.instantType}
  {...rest}
/>
