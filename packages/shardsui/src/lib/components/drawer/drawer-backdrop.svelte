<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import { attachElement } from '$lib/internal/attach-element'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { DialogContext } from '$lib/components/dialog/context'
  import { DrawerContext } from './context'

  type Props = PartProps<[AnchoredBackdropState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const drawer = DrawerContext.get()
  const dialog = DialogContext.get()

  const drawerState: AnchoredBackdropState = $derived({
    open: dialog.open,
    transitionStatus: dialog.transitionStatus
  })

  const stateAttrs = $derived(dataAttrs({ 'swipe-dismiss': drawer.swipeDismissed }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...dialog.transitionAttrs}
  {...dialog.nestedAttrs}
  {...stateAttrs}
  {@attach attachElement((el) => (dialog.backdropElement = el))}
  hidden={!dialog.mounted}
  style:user-select="none"
  style:-webkit-user-select="none"
  style:pointer-events={dialog.open ? null : 'none'}
  style:--drawer-swipe-progress="0"
  style:--drawer-swipe-strength="1"
  {style}
  role="presentation"
  {...rest}
>
  {@render children?.(drawerState)}
</svelte:element>
