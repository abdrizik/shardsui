<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
  import { Dialog } from '$lib/components/dialog'
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-1">
        <Dialog.Root>
          <Dialog.Trigger data-testid="dialog-trigger">Open dialog</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Popup
              data-testid="dialog-popup"
              onclick={(event: MouseEvent) => {
                event.stopPropagation()
              }}
            >
              <button type="button" data-testid="dialog-button">Dialog button</button>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
