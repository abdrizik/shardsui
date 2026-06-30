<script lang="ts">
  import { untrack } from 'svelte'
  import { Drawer, type DrawerSwipeDirection, type DrawerSnapPoint } from '$lib/components/drawer'

  let {
    swipeDirection = 'down',
    snapPoints = ['100px', '300px', 1],
    snapToSequentialPoints = false,
    initialSnapPoint = undefined,
    viewportHeight = 600,
    popupHeight = 600,
    showActiveSnap = false,
    withBackdrop = true,
    onOpenChange = undefined,
    onSnapPointChange = undefined
  }: {
    swipeDirection?: DrawerSwipeDirection
    snapPoints?: DrawerSnapPoint[]
    snapToSequentialPoints?: boolean
    initialSnapPoint?: DrawerSnapPoint | null
    viewportHeight?: number
    popupHeight?: number
    showActiveSnap?: boolean
    withBackdrop?: boolean
    onOpenChange?: (open: boolean) => void
    onSnapPointChange?: (snapPoint: DrawerSnapPoint | null) => void
  } = $props()

  let open = $state(true)
  let snapPoint = $state<DrawerSnapPoint | null>(
    untrack(() => initialSnapPoint ?? snapPoints[0] ?? null)
  )

  function handleOpenChange(next: boolean) {
    open = next
    onOpenChange?.(next)
  }
</script>

{#if showActiveSnap}
  <div data-testid="active-snap">{String(snapPoint)}</div>
{/if}
<button data-testid="snap-to-first" onclick={() => (snapPoint = snapPoints[0] ?? null)}>
  Snap to first
</button>
<Drawer.Root
  {open}
  onOpenChange={handleOpenChange}
  snapPoints={[...snapPoints]}
  bind:snapPoint
  {snapToSequentialPoints}
  {onSnapPointChange}
  {swipeDirection}
>
  <Drawer.Portal>
    {#if withBackdrop}
      <Drawer.Backdrop data-testid="backdrop" />
    {/if}
    <Drawer.Viewport data-testid="viewport" style="height: {viewportHeight}px;">
      <Drawer.Popup data-testid="popup" style="height: {popupHeight}px;">Drawer</Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
