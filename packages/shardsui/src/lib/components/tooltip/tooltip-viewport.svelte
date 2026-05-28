<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { TooltipContext, TooltipPositionerContext, type TooltipViewportState } from './context'
  import PopupViewportElement from '$lib/internal/popup-viewport-element.svelte'
  import { DirectionContext } from '$lib/internal/direction-context'

  type Props = PartProps<[TooltipViewportState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const tooltip = TooltipContext.get()
  const positioner = TooltipPositionerContext.get()
  const direction = DirectionContext.get()
</script>

<PopupViewportElement
  bind:ref
  {as}
  {children}
  activeTrigger={tooltip.triggerElement}
  activeTriggerId={tooltip.activeTriggerId}
  payload={tooltip.payload}
  open={tooltip.open}
  popupElement={tooltip.popupElement}
  positionerElement={tooltip.positionerElement}
  side={positioner.side}
  direction={direction.direction}
  mounted={tooltip.mounted}
  instantType={tooltip.instantType}
  bind:hasViewport={tooltip.hasViewport}
  {...rest}
/>
