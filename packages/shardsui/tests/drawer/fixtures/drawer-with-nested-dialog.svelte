<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
  import { Dialog } from '$lib/components/dialog'
</script>

<Drawer.Root open modal={false}>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup data-testid="parent-popup">
        <Drawer.Root open modal={false}>
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup data-testid="child-popup">
                <Dialog.Root modal={false}>
                  <Dialog.Trigger>Open dialog</Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Popup data-testid="dialog-popup">Dialog</Dialog.Popup>
                  </Dialog.Portal>
                </Dialog.Root>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
