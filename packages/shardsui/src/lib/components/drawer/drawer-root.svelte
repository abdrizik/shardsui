<script lang="ts" generics="Payload = unknown">
  import { untrack, type Snippet } from 'svelte'
  import { on } from 'svelte/events'
  import { DialogRoot } from '$lib/components/dialog/dialog.svelte'
  import { REASONS } from '$lib/internal/reasons'
  import { DialogContext } from '$lib/components/dialog/context'
  import { isAndroid } from '$lib/internal/detect-browser'
  import type { DrawerHandle } from './handle.svelte'
  import { DrawerProviderContext, DrawerContext } from './context'
  import { DrawerRoot, type DrawerSnapPoint, type DrawerSwipeDirection } from './drawer.svelte'

  type Props = {
    open?: boolean
    modal?: boolean | 'trap-focus'
    disablePointerDismissal?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    swipeDirection?: DrawerSwipeDirection
    snapPoints?: DrawerSnapPoint[]
    snapPoint?: DrawerSnapPoint | null
    snapToSequentialPoints?: boolean
    onSnapPointChange?: (snapPoint: DrawerSnapPoint | null) => void
    triggerId?: string | null
    handle?: DrawerHandle<Payload>
    children?: Snippet<[{ payload: Payload | undefined }]>
  }

  let {
    open = $bindable(false),
    modal = true,
    disablePointerDismissal = false,
    onOpenChange,
    onOpenChangeComplete,
    swipeDirection = 'down',
    snapPoints,
    snapPoint = $bindable(snapPoints?.[0] ?? null),
    snapToSequentialPoints = false,
    onSnapPointChange,
    triggerId = $bindable(null),
    handle,
    children
  }: Props = $props()

  const parentDrawer = DrawerContext.getOr()
  const initialSnapPoint = untrack(() => snapPoint)

  const drawer = new DrawerRoot(() => ({
    parent: parentDrawer,
    swipeDirection,
    snapPoints,
    snapPoint,
    snapToSequentialPoints,
    setSnapPoint: (next) => {
      onSnapPointChange?.(next)
      snapPoint = next
    }
  }))

  DrawerContext.set(drawer)

  const dialog = untrack(() => (handle ? handle.state : new DialogRoot<Payload>()))
  dialog.attach(() => ({
    open,
    setOpen: (next) => {
      onOpenChange?.(next)
      open = next
      if (!next && snapPoints && snapPoints.length > 0) {
        drawer.setActiveSnapPoint(initialSnapPoint)
      }
    },
    modal,
    disablePointerDismissal,
    isDrawer: true,
    onOpenChangeComplete,
    triggerId,
    setTriggerId: (next) => {
      triggerId = next
    },
    detachedRoot: handle?.state
  }))

  DialogContext.set(dialog)

  const provider = DrawerProviderContext.getOr()
  const isTopmost = $derived(dialog.nestedOpenCount === 0)

  $effect(() => {
    provider?.setDrawerOpen(dialog, dialog.open)
    return () => provider?.setDrawerOpen(dialog, false)
  })

  $effect(() => {
    if (!dialog.open || !isTopmost || !isAndroid) return

    const win = dialog.popupElement?.ownerDocument.defaultView ?? window

    const CloseWatcherCtor = (
      win as Window & {
        CloseWatcher?: (new () => EventTarget & { destroy(): void }) | undefined
      }
    ).CloseWatcher
    if (!CloseWatcherCtor) return

    function onclose(event: Event) {
      if (!dialog.open) return
      dialog.setOpen(false, REASONS.closeWatcher, event)
    }

    const closeWatcher = new CloseWatcherCtor()
    const unsubscribe = on(closeWatcher, 'close', onclose)

    return () => {
      unsubscribe()
      closeWatcher.destroy()
    }
  })
</script>

{@render children?.({ payload: dialog.payload })}
