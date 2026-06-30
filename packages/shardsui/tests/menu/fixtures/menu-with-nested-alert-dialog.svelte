<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'
  import { Menu } from '$lib/components/menu'
</script>

<Menu.Root>
  <Menu.Trigger data-testid="menu-trigger">Open Menu</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup data-testid="menu-popup">
        <Menu.Item>Item 1</Menu.Item>
        <AlertDialog.Root>
          <Menu.Item closeOnClick={false} data-testid="alert-dialog-item">
            <AlertDialog.Trigger data-testid="alert-dialog-trigger">
              Open Alert Dialog
            </AlertDialog.Trigger>
          </Menu.Item>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop data-testid="alert-dialog-backdrop" />
            <AlertDialog.Popup data-testid="alert-dialog-popup">
              <AlertDialog.Close data-testid="alert-dialog-close">Close</AlertDialog.Close>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
        <Menu.Item>Item 2</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
