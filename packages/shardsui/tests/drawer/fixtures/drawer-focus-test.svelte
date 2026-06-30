<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
</script>

<div>
  <input />
  <Drawer.Root modal={false}>
    <Drawer.Trigger>Open</Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Viewport>
        <Drawer.Popup data-testid="popup">
          <input data-testid="popup-input" />
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>
</div>
