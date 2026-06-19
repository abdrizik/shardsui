<script lang="ts" generics="Payload = unknown">
  import { untrack, type Snippet } from 'svelte'
  import { MenuRoot } from './menu.svelte'
  import { MenuContext } from './context'
  import { FloatingTreeContext } from '$lib/internal/floating/floating-tree.svelte'
  import type { MenuHandle } from './handle.svelte'

  type Props = {
    open?: boolean
    disabled?: boolean
    modal?: boolean
    loopFocus?: boolean
    orientation?: 'horizontal' | 'vertical'
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    closeParentOnEsc?: boolean
    highlightItemOnHover?: boolean
    handle?: MenuHandle<Payload>
    triggerId?: string | null
    children?: Snippet<[{ payload: Payload | undefined }]>
  }

  let {
    open = $bindable(false),
    disabled = false,
    modal = true,
    loopFocus = true,
    orientation = 'vertical',
    onOpenChange,
    onOpenChangeComplete,
    closeParentOnEsc = false,
    highlightItemOnHover = true,
    handle,
    triggerId = $bindable(null),
    children
  }: Props = $props()

  const uid = $props.id()

  const menu = untrack(() => (handle ? handle.state : new MenuRoot<Payload>()))
  menu.attach(() => ({
    open,
    setOpen: (next) => (open = next),
    disabled,
    modal,
    loopFocus,
    orientation,
    closeParentOnEsc,
    highlightItemOnHover,
    onOpenChange,
    onOpenChangeComplete,
    triggerId,
    setTriggerId: (next) => {
      triggerId = next
    },
    ownId: uid
  }))

  MenuContext.set(menu)
  if (menu.providesFloatingTree) {
    FloatingTreeContext.set(menu.tree)
  }
</script>

{@render children?.({ payload: menu.payload })}
