<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import { dismiss } from '$lib/internal/floating/dismiss.svelte'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { anchoredPopupAttrs } from '$lib/internal/anchored-state'
  import { hoverFloatingInteraction } from '$lib/internal/floating/hover/floating.svelte'
  import { publishCloseGuardContext } from '$lib/internal/floating/publish-close-guard-context.svelte'
  import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import {
    PreviewCardPositionerContext,
    PreviewCardContext,
    type PreviewCardPopupState
  } from './context'

  type Props = PartProps<[PreviewCardPopupState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const previewCard = PreviewCardContext.get()
  const positioner = PreviewCardPositionerContext.get()

  openChangeComplete(() => ({
    open: previewCard.open,
    element: ref,
    onComplete: () => {
      if (previewCard.open) previewCard.onOpenChangeComplete?.(true)
    }
  }))

  hoverFloatingInteraction(previewCard, () => ({
    closeDelay: previewCard.closeDelay,
    nodeId: previewCard.floatingNodeId
  }))

  publishCloseGuardContext(() => ({
    data: previewCard.data,
    side: positioner.renderedSide,
    domReference: previewCard.domReferenceElement,
    floating: previewCard.floatingElement
  }))

  dismiss(() => ({
    open: previewCard.open,
    onClose: (reason, event) => previewCard.setOpen(false, reason, event),
    popupElement: ref,
    referenceElement: previewCard.domReferenceElement,
    isInsideElement: previewCard.containsTrigger,
    tree: previewCard.floatingTree,
    nodeId: previewCard.floatingNodeId
  }))

  const mergedStyle = $derived(
    mergeStyle(getDisabledMountTransitionStyles(previewCard.transitionStatus), style)
  )

  const previewCardState: PreviewCardPopupState = $derived({
    open: previewCard.open,
    side: positioner.side,
    align: positioner.align,
    instant: previewCard.instantType,
    transitionStatus: previewCard.transitionStatus
  })

  const stateAttrs = $derived(anchoredPopupAttrs(previewCardState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (previewCard.popupElement = el))}
  style={mergedStyle}
  tabindex={-1}
  data-shards-ui-focusable=""
  {...rest}
>
  {@render children?.(previewCardState)}
</svelte:element>
