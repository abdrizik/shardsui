<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
</script>

<Drawer.Root open modal={false}>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup data-testid="parent-popup">
        <Drawer.Root modal={false}>
          <Drawer.Trigger>Open nested drawer</Drawer.Trigger>
          <Drawer.Portal keepMounted>
            <Drawer.Viewport>
              <Drawer.Popup data-testid="child-popup">
                <Drawer.Close>Close nested drawer</Drawer.Close>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
