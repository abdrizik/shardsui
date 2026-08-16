<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import FocusGuard from '$lib/internal/focus-guard.svelte'
  import { chain } from '$lib/internal/chain'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { ownerVisuallyHidden } from '$lib/internal/visually-hidden'
  import {
    NavigationMenuItemContext,
    NavigationMenuCompositeContext,
    NavigationMenuContext,
    type NavigationMenuTriggerState
  } from './context'
  import { NavigationMenuTrigger } from './trigger.svelte'

  type Props = PartProps<
    [NavigationMenuTriggerState],
    'button',
    | 'onblur'
    | 'onclick'
    | 'onfocus'
    | 'onkeydown'
    | 'onkeyup'
    | 'onmouseenter'
    | 'onmousemove'
    | 'onpointerdown'
    | 'onpointerenter'
  > & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled = false,
    onclick,
    onmousedown,
    onmouseenter,
    onmousemove,
    onpointerenter,
    onpointerdown,
    onfocus,
    onblur,
    onkeydown,
    onkeyup,
    children,
    ...rest
  }: Props = $props()

  const uid = $props.id()

  const navigationMenu = NavigationMenuContext.get()
  const item = NavigationMenuItemContext.get()
  const composite = NavigationMenuCompositeContext.getOr()
  const direction = DirectionContext.get()

  const trigger = new NavigationMenuTrigger(navigationMenu, item, composite, direction, () => ({
    ref,
    triggerId: uid,
    disabled,
    as,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const navigationMenuState: NavigationMenuTriggerState = $derived({ open: trigger.isActive })

  const stateAttrs = $derived(
    dataAttrs({ 'popup-open': trigger.isActive, pressed: trigger.isActive })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...trigger.attrs}
  {...stateAttrs}
  {@attach trigger.registerTrigger}
  {@attach trigger.attach}
  aria-expanded={trigger.isActive}
  aria-controls={trigger.isActive ? navigationMenu.popupElement?.id : undefined}
  tabindex={0}
  onmouseenter={chain(onmouseenter, trigger.onmouseenter)}
  onmousemove={chain(onmousemove, trigger.onmousemove)}
  onpointerenter={chain(onpointerenter, trigger.onpointerenter)}
  onfocus={chain(onfocus, trigger.onfocus)}
  onblur={chain(onblur, trigger.onblur)}
  {...rest}
>
  {@render children?.(navigationMenuState)}
</svelte:element>

{#if trigger.isActive}
  <FocusGuard bind:ref={navigationMenu.beforeOutsideElement} onfocus={trigger.focusBeforeGuard} />
  <span aria-owns={navigationMenu.viewportElement?.id} style={ownerVisuallyHidden}></span>
  <FocusGuard bind:ref={navigationMenu.afterOutsideElement} onfocus={trigger.focusAfterGuard} />
{/if}
