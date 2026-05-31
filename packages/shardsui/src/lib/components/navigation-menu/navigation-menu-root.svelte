<script lang="ts" generics="Value = unknown">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import {
    NavigationMenuPositionerContext,
    NavigationMenuContext,
    type NavigationMenuRootState
  } from './context'
  import { NavigationMenuRoot } from './navigation-menu.svelte'

  type Props = PartProps<[NavigationMenuRootState], 'nav'> & {
    value?: Value | null
    onValueChange?: (value: Value | null) => void
    delay?: number
    closeDelay?: number
    orientation?: 'horizontal' | 'vertical'
    onOpenChangeComplete?: (open: boolean) => void
  }

  const parent = NavigationMenuContext.getOr()

  let {
    as = parent ? 'div' : 'nav',
    ref = $bindable(null),
    value = $bindable(null),
    onValueChange,
    delay = 50,
    closeDelay = 50,
    orientation = 'horizontal',
    onOpenChangeComplete,
    children,
    ...rest
  }: Props = $props()

  const navigationMenu = new NavigationMenuRoot(() => ({
    value,
    setValue: (next) => (value = next as Value | null),
    delay,
    closeDelay,
    orientation,
    onValueChange: (v) => onValueChange?.(v as Value | null),
    onOpenChangeComplete,
    parentRoot: parent,
    ref
  }))

  NavigationMenuContext.set(navigationMenu)
  NavigationMenuPositionerContext.set(undefined)

  const navigationMenuState: NavigationMenuRootState = $derived({
    open: navigationMenu.open,
    nested: navigationMenu.nested
  })

  const stateAttrs = $derived(
    dataAttrs({ open: navigationMenu.open, nested: navigationMenu.nested })
  )
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {...rest}>
  {@render children?.(navigationMenuState)}
</svelte:element>
