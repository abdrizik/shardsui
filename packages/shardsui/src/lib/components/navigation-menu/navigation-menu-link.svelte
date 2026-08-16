<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import { REASONS } from '$lib/internal/reasons'
  import type { PartProps } from '$lib/internal/types'
  import {
    NavigationMenuCompositeContext,
    NavigationMenuContext,
    type NavigationMenuLinkState
  } from './context'

  type Props = PartProps<[NavigationMenuLinkState], 'a', 'onblur' | 'onclick' | 'onfocus'> & {
    active?: boolean
    closeOnClick?: boolean
  }

  let {
    as = 'a',
    ref = $bindable(null),
    active = false,
    closeOnClick = false,
    onclick,
    onfocus,
    onblur,
    children,
    ...rest
  }: Props = $props()

  const navigationMenu = NavigationMenuContext.get()
  const composite = NavigationMenuCompositeContext.getOr()

  const item = composite ? new CompositeItem(() => ({ composite, ref, disabled: false })) : null

  function closeMenuOnClick(event: MouseEvent) {
    if (closeOnClick) {
      navigationMenu.setValue(null, REASONS.linkPress, event)
    }
  }

  const navigationMenuState: NavigationMenuLinkState = $derived({ active })

  const stateAttrs = $derived(dataAttrs({ active }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  aria-current={active ? 'page' : undefined}
  onclick={chain(onclick, closeMenuOnClick)}
  onfocus={chain(onfocus, item?.onfocus)}
  onblur={chain(onblur, (event) => navigationMenu.closeOnFocusOut(ref, event))}
  {...rest}
>
  {@render children?.(navigationMenuState)}
</svelte:element>
