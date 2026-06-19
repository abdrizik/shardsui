<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { MenuContext, MenuPositionerContext, type MenuViewportState } from './context'
  import PopupViewportElement from '$lib/internal/popup-viewport-element.svelte'
  import { DirectionContext } from '$lib/internal/direction-context'

  type Props = PartProps<[MenuViewportState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const menu = MenuContext.get()
  const positioner = MenuPositionerContext.getOr()
  const direction = DirectionContext.get()
</script>

<PopupViewportElement
  bind:ref
  {as}
  {children}
  activeTrigger={menu.triggerElement}
  payload={menu.payload}
  popupElement={menu.popupElement}
  positionerElement={menu.positionerElement}
  side={positioner?.side ?? 'bottom'}
  direction={direction.direction}
  mounted={menu.mounted}
  open={menu.open}
  instantType={menu.instantType}
  bind:hasViewport={menu.hasViewport}
  {...rest}
/>
