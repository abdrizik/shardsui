<script lang="ts">
  import type { MenuTreeEvents } from '$lib/components/menu/context'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { FloatingTree, FloatingTreeContext } from '$lib/internal/floating/floating-tree.svelte'
  import type { Orientation, PartProps } from '$lib/internal/types'
  import { MenubarContext } from './context'
  import { MenubarRoot } from './menubar.svelte'

  type MenubarState = {
    orientation: Orientation
    modal: boolean
    hasSubmenuOpen: boolean
  }

  type Props = PartProps<[MenubarState]> & {
    modal?: boolean
    disabled?: boolean
    orientation?: Orientation
    loopFocus?: boolean
  }

  const uid = $props.id()

  let {
    as = 'div',
    ref = $bindable(null),
    id = uid,
    modal = true,
    disabled = false,
    orientation = 'horizontal',
    loopFocus = true,
    onkeydown,
    children,
    ...rest
  }: Props = $props()

  FloatingTreeContext.set(new FloatingTree<MenuTreeEvents>() as FloatingTree)

  const menubar = new MenubarRoot(() => ({ id, modal, disabled, orientation, loopFocus, ref }))

  MenubarContext.set(menubar)

  const menubarState: MenubarState = $derived({
    orientation,
    modal,
    hasSubmenuOpen: menubar.hasSubmenuOpen
  })

  const stateAttrs = $derived(
    dataAttrs({ orientation, modal, 'has-submenu-open': menubar.hasSubmenuOpen })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {id}
  role="menubar"
  aria-orientation={orientation}
  onkeydown={chain(onkeydown, menubar.composite.onkeydown)}
  {...rest}
>
  {@render children?.(menubarState)}
</svelte:element>
