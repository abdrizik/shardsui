<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import {
    PreviewCardContext,
    PreviewCardPositionerContext,
    type PreviewCardViewportState
  } from './context'
  import PopupViewportElement from '$lib/internal/popup-viewport-element.svelte'
  import { DirectionContext } from '$lib/internal/direction-context'

  type Props = PartProps<[PreviewCardViewportState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const previewCard = PreviewCardContext.get()
  const positioner = PreviewCardPositionerContext.get()
  const direction = DirectionContext.get()
</script>

<PopupViewportElement
  bind:ref
  {as}
  {children}
  activeTrigger={previewCard.triggerElement}
  activeTriggerId={previewCard.activeTriggerId}
  payload={previewCard.payload}
  open={previewCard.open}
  popupElement={previewCard.popupElement}
  positionerElement={previewCard.positionerElement}
  side={positioner.side}
  direction={direction.direction}
  mounted={previewCard.mounted}
  instantType={previewCard.instantType}
  bind:hasViewport={previewCard.hasViewport}
  {...rest}
/>
