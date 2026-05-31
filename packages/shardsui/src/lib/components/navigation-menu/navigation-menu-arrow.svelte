<script lang="ts">
  import type { AnchoredArrowState } from '$lib/internal/anchored-state'
  import type { PartProps } from '$lib/internal/types'
  import { NavigationMenuPositionerContext, NavigationMenuContext } from './context'
  import PositionerArrow from '$lib/internal/positioner-arrow.svelte'
  import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
  import { mergeStyle } from '$lib/internal/merge-style'

  type Props = PartProps<[AnchoredArrowState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
  const positioner = NavigationMenuPositionerContext.get()

  const mergedStyle = $derived(
    mergeStyle(getDisabledMountTransitionStyles(navigationMenu.transitionStatus), style)
  )
</script>

<PositionerArrow
  {positioner}
  bind:ref
  {as}
  style={mergedStyle}
  {children}
  open={navigationMenu.open}
  {...rest}
/>
