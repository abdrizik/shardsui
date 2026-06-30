<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
</script>

<Drawer.Root open swipeDirection="down">
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport data-testid="viewport">
      <Drawer.Popup>
        <Drawer.Content>
          <button type="button" data-testid="button">Action</button>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
