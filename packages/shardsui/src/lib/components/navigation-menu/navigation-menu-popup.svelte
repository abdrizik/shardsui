<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import { anchoredPopupAttrs } from '$lib/internal/anchored-state'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { getDisabledMountTransitionStyles } from '$lib/internal/get-disabled-mount-transition-styles'
  import type { PartProps } from '$lib/internal/types'
  import {
    NavigationMenuPositionerContext,
    NavigationMenuContext,
    type NavigationMenuPopupState
  } from './context'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { mergeStyle } from '$lib/internal/merge-style'

  type Props = PartProps<[NavigationMenuPopupState], 'nav'>

  const uid = $props.id()

  let { as = 'nav', ref = $bindable(null), style, id = uid, children, ...rest }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
  const positioner = NavigationMenuPositionerContext.get()
  const direction = DirectionContext.get()

  const side = $derived(positioner.side)

  const isPhysicalLeft = $derived(
    side === 'left' ||
      (direction.direction === 'rtl' ? side === 'inline-end' : side === 'inline-start')
  )

  const isOriginSide = $derived(side === 'top' || isPhysicalLeft)

  const originStyle = $derived.by(() => {
    if (!isOriginSide) return ''
    const verticalProp = side === 'top' ? 'bottom:0;' : 'top:0;'
    const horizontalProp = isPhysicalLeft ? 'right:0;' : 'left:0;'
    return `position:absolute;${verticalProp}${horizontalProp}`
  })

  const mergedStyle = $derived(
    mergeStyle(
      originStyle,
      getDisabledMountTransitionStyles(navigationMenu.transitionStatus),
      style
    )
  )

  const navigationMenuState: NavigationMenuPopupState = $derived({
    open: navigationMenu.open,
    transitionStatus: navigationMenu.transitionStatus,
    side,
    align: positioner.align,
    anchorHidden: positioner.anchorHidden
  })

  const stateAttrs = $derived({
    ...anchoredPopupAttrs(navigationMenuState),
    ...dataAttrs({ 'anchor-hidden': positioner.anchorHidden })
  })
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (navigationMenu.popupElement = el))}
  {id}
  style={mergedStyle}
  tabindex={-1}
  {...rest}
>
  {@render children?.(navigationMenuState)}
</svelte:element>
