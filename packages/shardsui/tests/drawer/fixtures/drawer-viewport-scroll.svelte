<script lang="ts">
  import { Drawer, type DrawerSwipeDirection } from '$lib/components/drawer'

  let {
    swipeDirection = 'down',
    variant = 'inner'
  }: {
    swipeDirection?: DrawerSwipeDirection
    variant?: 'inner' | 'ancestor' | 'none'
  } = $props()
</script>

<Drawer.Root open {swipeDirection}>
  <Drawer.Portal>
    <Drawer.Viewport data-testid="viewport">
      {#if variant === 'ancestor'}
        <div data-testid="scroll" style="overflow-y: auto; max-height: 40px;">
          <Drawer.Popup data-testid="popup">
            <Drawer.Content>
              <span data-testid="item">Scrollable content</span>
            </Drawer.Content>
          </Drawer.Popup>
        </div>
      {:else if variant === 'none'}
        <Drawer.Popup data-testid="popup">
          <Drawer.Content>Content</Drawer.Content>
        </Drawer.Popup>
      {:else}
        <Drawer.Popup data-testid="popup">
          <div data-testid="scroll" style="overflow-y: auto; max-height: 40px;">
            <div style="height: 120px;">Scrollable content</div>
          </div>
        </Drawer.Popup>
      {/if}
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
