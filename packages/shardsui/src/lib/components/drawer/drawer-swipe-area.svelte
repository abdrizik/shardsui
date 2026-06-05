<script lang="ts">
  import { DialogContext } from '$lib/components/dialog/context'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { DrawerProviderContext, DrawerContext, type DrawerSwipeAreaState } from './context'
  import { DrawerSwipeArea } from './swipe-area.svelte'
  import type { DrawerSwipeDirection } from './drawer.svelte'

  type Props = PartProps<[DrawerSwipeAreaState]> & {
    disabled?: boolean
    swipeDirection?: DrawerSwipeDirection
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    style,
    id = uid,
    disabled = false,
    swipeDirection,
    children,
    ...rest
  }: Props = $props()

  const drawer = DrawerContext.get()
  const dialog = DialogContext.get()
  const provider = DrawerProviderContext.getOr()

  const area = new DrawerSwipeArea(dialog, drawer, provider, () => ({
    ref,
    id,
    disabled,
    swipeDirection
  }))

  const drawerState: DrawerSwipeAreaState = $derived({
    open: dialog.open,
    swiping: area.swiping,
    swipeDirection: area.swipeDirection,
    disabled
  })

  const stateAttrs = $derived(
    dataAttrs({
      open: dialog.open,
      closed: !dialog.open,
      swiping: area.swiping,
      'swipe-direction': area.swipeDirection,
      disabled
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach area.attach}
  role="presentation"
  aria-hidden="true"
  {id}
  style:touch-action={area.touchAction}
  style:pointer-events={area.enabled ? null : 'none'}
  {style}
  {...rest}
>
  {@render children?.(drawerState)}
</svelte:element>
