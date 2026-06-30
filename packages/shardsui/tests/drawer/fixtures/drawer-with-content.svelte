<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
</script>

<Drawer.Root open>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Content data-testid="content">Content</Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
