<script lang="ts" generics="Payload = unknown">
  import { untrack } from 'svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { chain } from '$lib/internal/chain'
  import FocusGuard from '$lib/internal/focus-guard.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { MenubarContext } from '$lib/components/menubar/context'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { MenuContext, type MenuTriggerState } from './context'
  import type { MenuHandle } from './handle.svelte'
  import type { MenuRoot } from './menu.svelte'
  import { MenuTrigger } from './trigger.svelte'

  type Props = PartProps<
    [MenuTriggerState],
    'button',
    | 'onclick'
    | 'onfocus'
    | 'onkeydown'
    | 'onkeyup'
    | 'onmousedown'
    | 'onmousemove'
    | 'onpointerdown'
  > & {
    disabled?: boolean
    openOnHover?: boolean
    delay?: number
    closeDelay?: number
    handle?: MenuHandle<Payload>
    payload?: Payload
  }

  const uid = $props.id()

  let {
    as = 'button',
    ref = $bindable(null),
    id = uid,
    disabled: disabledProp = false,
    openOnHover,
    delay = 100,
    closeDelay = 0,
    handle: handleProp,
    payload,
    onclick,
    onmousedown,
    onmousemove,
    onpointerdown,
    onfocus,
    onkeydown,
    onkeyup,
    children,
    ...rest
  }: Props = $props()

  const handle = untrack(() => handleProp)
  const menu: MenuRoot = handle ? handle.state : MenuContext.get()
  const menubar = MenubarContext.getOr()
  const direction = DirectionContext.get()

  const trigger = new MenuTrigger<Payload>(menu, menubar, () => ({
    ref,
    id,
    as,
    rtl: direction.direction === 'rtl',
    disabled: disabledProp,
    openOnHover,
    delay,
    closeDelay,
    payload,
    detached: handle != null,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': trigger.open,
      pressed: trigger.open,
      disabled: trigger.disabled
    })
  )
</script>

{#if trigger.open && !menubar}
  <FocusGuard
    bind:ref={trigger.guards.preFocusGuardElement}
    onfocus={trigger.guards.closeAndFocusBefore}
  />
{/if}
<svelte:element
  this={as}
  bind:this={ref}
  {...trigger.attrs}
  {...stateAttrs}
  {@attach trigger.attach}
  {id}
  aria-haspopup="menu"
  aria-expanded={trigger.open}
  aria-controls={trigger.open ? menu.popupId : undefined}
  {...menubar ? { tabindex: trigger.tabindex, role: 'menuitem' } : {}}
  onmousedown={trigger.onmousedown}
  onmousemove={chain(onmousemove, trigger.onmousemove)}
  onfocus={chain(onfocus, trigger.onfocus)}
  {...rest}
>
  {@render children?.({ disabled: trigger.disabled, open: trigger.open })}
</svelte:element>
{#if trigger.open && !menubar}
  <FocusGuard
    bind:ref={menu.triggerFocusTargetElement}
    onfocus={trigger.guards.closeAndFocusAfter}
  />
{/if}
