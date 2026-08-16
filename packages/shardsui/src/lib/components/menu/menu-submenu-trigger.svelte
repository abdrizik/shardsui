<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { MenuContext, type MenuSubmenuTriggerState } from './context'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { hoverReferenceInteraction } from '$lib/internal/floating/hover/reference.svelte'
  import { safePolygon } from '$lib/internal/floating/safe-polygon.svelte'
  import { DirectionContext } from '$lib/internal/direction-context'
  import { REASONS } from '$lib/internal/reasons'
  import { MenuItemRegistration } from './item-base.svelte'
  import { isIOS, isMac } from '$lib/internal/detect-browser'
  import { isVirtualPointerEvent } from '$lib/internal/floating/event'
  import { attachElement } from '$lib/internal/attach-element'

  type Props = PartProps<
    [MenuSubmenuTriggerState],
    'div',
    | 'onblur'
    | 'onclick'
    | 'onkeydown'
    | 'onkeyup'
    | 'onmousedown'
    | 'onmousemove'
    | 'onpointerdown'
    | 'onpointerleave'
  > & {
    disabled?: boolean
    delay?: number
    closeDelay?: number
    openOnHover?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    disabled: disabledProp = false,
    delay = 100,
    closeDelay = 0,
    openOnHover = true,
    onclick,
    onmousedown,
    onmousemove,
    onpointerleave,
    onkeydown,
    onkeyup,
    onpointerdown,
    onblur,
    children,
    ...rest
  }: Props = $props()

  const menu = MenuContext.get()
  const direction = DirectionContext.get()

  const parentMenu = menu.parent

  let pointerType: string | undefined
  let openedByKeyboard = $state(false)

  const disabled = $derived(disabledProp || menu.disabled || (parentMenu?.disabled ?? false))

  const registration = new MenuItemRegistration(() => ({
    menu: parentMenu,
    ref,
    disabled
  }))

  $effect(() => {
    menu.hoverCloseDelay = closeDelay
  })

  $effect(() => {
    if (!ref) return
    return menu.triggerElements.add(id, ref)
  })

  const safePolygonGuard = safePolygon(() => ({ blockPointerEvents: true }))
  hoverReferenceInteraction(menu, () => ({
    enabled: openOnHover && !disabled && menu.hoverEnabled,
    mouseOnly: true,
    move: true,
    closeGuard: safePolygonGuard,
    restMs: delay,
    delay: { open: delay, close: closeDelay },
    shouldAllowOpen: delay > 0 ? (parentMenu?.allowMouseEnter ?? false) : true,
    triggerElement: ref,
    isActiveTrigger: menu.triggerElement === ref,
    // Chrome can drop the trigger's `mouseleave` during a fast pointer sweep,
    // leaving a stale submenu open — cancel from `mouseout` too.
    guardStaleOpen: true
  }))

  function trackPointerType(event: PointerEvent) {
    pointerType = isVirtualPointerEvent(event) ? '' : event.pointerType
  }

  function openOnPress(event: MouseEvent) {
    if (event.button !== 0) return
    if (openOnHover && (pointerType === 'mouse' || pointerType === 'pen')) return
    openSubmenu()
  }

  function openOnClick() {
    if (pointerType !== undefined) {
      pointerType = undefined
      return
    }
    openSubmenu()
  }

  function openSubmenu() {
    openedByKeyboard = false
    menu.setOpen(openOnHover ? true : !menu.open, REASONS.triggerPress)
  }

  function openOnKey(event: KeyboardEvent) {
    pointerType = undefined
    const rtl = direction.direction === 'rtl'
    const parentOrientation = parentMenu?.orientation ?? 'vertical'
    const openKey =
      parentOrientation === 'horizontal' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    if (event.key === ' ' && parentMenu?.typing) {
      event.preventDefault()
      return
    }
    if (event.key === openKey || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (event.key === openKey) event.stopPropagation()
      const reason = event.key === openKey ? REASONS.listNavigation : REASONS.triggerPress
      openedByKeyboard = true
      menu.openAndFocus('first', reason, event)
    }
  }

  function clearHighlightOnBlur() {
    if (parentMenu && registration.highlighted) {
      parentMenu.items.highlightedIndex = -1
    }
  }

  const btn = new Button(() => ({
    disabled,
    focusableWhenDisabled: true,
    as,
    composite: true,
    onpointerdown: chain(onpointerdown, trackPointerType),
    onclick: chain(onclick, openOnClick),
    onmousedown: chain(onmousedown, openOnPress),
    onkeydown: chain(onkeydown, openOnKey),
    onkeyup
  }))

  const omitExpandedForVoiceOver = $derived(
    menu.open &&
      (isMac || isIOS) &&
      (menu.openChangeReason === REASONS.listNavigation ||
        (menu.openChangeReason === REASONS.triggerPress && openedByKeyboard))
  )

  const stateAttrs = $derived(
    dataAttrs({ 'popup-open': menu.open, highlighted: registration.highlighted, disabled })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {@attach attachElement((el) => (menu.triggerElement = el))}
  {id}
  aria-haspopup="menu"
  aria-expanded={omitExpandedForVoiceOver ? undefined : menu.open}
  aria-controls={menu.open ? menu.popupId : undefined}
  role="menuitem"
  tabindex={menu.open || registration.highlighted ? 0 : -1}
  onmousemove={chain(onmousemove, registration.highlightOnHover)}
  onpointerleave={chain(onpointerleave, registration.clearHighlightOnLeave)}
  onblur={chain(onblur, clearHighlightOnBlur)}
  {...rest}
>
  {@render children?.({ disabled, highlighted: registration.highlighted, open: menu.open })}
</svelte:element>
