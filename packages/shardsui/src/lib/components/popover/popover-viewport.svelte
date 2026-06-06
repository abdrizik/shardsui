<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { PopoverContext, PopoverPositionerContext, type PopoverViewportState } from './context'
  import PopupViewportElement from '$lib/internal/popup-viewport-element.svelte'
  import { DirectionContext } from '$lib/internal/direction-context'

  type Props = PartProps<[PopoverViewportState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const popover = PopoverContext.get()
  const positioner = PopoverPositionerContext.get()
  const direction = DirectionContext.get()
</script>

<PopupViewportElement
  bind:ref
  {as}
  {children}
  activeTrigger={popover.triggerElement}
  activeTriggerId={popover.activeTriggerId}
  payload={popover.payload}
  open={popover.open}
  popupElement={popover.popupElement}
  positionerElement={popover.positionerElement}
  side={positioner.side}
  direction={direction.direction}
  mounted={popover.mounted}
  instantType={popover.instantType}
  bind:hasViewport={popover.hasViewport}
  {...rest}
/>
