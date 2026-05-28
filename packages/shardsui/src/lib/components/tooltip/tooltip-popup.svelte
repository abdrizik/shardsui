<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import { openChangeComplete } from '$lib/internal/open-change-complete.svelte'
  import { anchoredPopupAttrs } from '$lib/internal/anchored-state'
  import { hoverFloatingInteraction } from '$lib/internal/floating/hover/floating.svelte'
  import { publishCloseGuardContext } from '$lib/internal/floating/publish-close-guard-context.svelte'
  import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
  import type { PartProps } from '$lib/internal/types'
  import { mergeStyle } from '$lib/internal/merge-style'
  import { TooltipPositionerContext, TooltipContext, type TooltipPopupState } from './context'

  type Props = PartProps<[TooltipPopupState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const tooltip = TooltipContext.get()
  const positioner = TooltipPositionerContext.get()

  openChangeComplete(() => ({
    open: tooltip.open,
    element: ref,
    onComplete: () => {
      if (tooltip.open) tooltip.onOpenChangeComplete?.(true)
    }
  }))

  hoverFloatingInteraction(tooltip, () => ({
    enabled: !tooltip.disabled,
    closeDelay: tooltip.closeDelay
  }))

  publishCloseGuardContext(() => ({
    data: tooltip.data,
    side: positioner.renderedSide,
    domReference: tooltip.domReferenceElement,
    floating: tooltip.floatingElement
  }))

  const mergedStyle = $derived(
    mergeStyle(getDisabledMountTransitionStyles(tooltip.transitionStatus), style)
  )

  const tooltipState: TooltipPopupState = $derived({
    open: tooltip.open,
    side: positioner.side,
    align: positioner.align,
    instant: tooltip.instantType,
    transitionStatus: tooltip.transitionStatus
  })

  const stateAttrs = $derived(anchoredPopupAttrs(tooltipState))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (tooltip.popupElement = el))}
  style={mergedStyle}
  tabindex={-1}
  data-shards-ui-focusable=""
  {...rest}
>
  {@render children?.(tooltipState)}
</svelte:element>
