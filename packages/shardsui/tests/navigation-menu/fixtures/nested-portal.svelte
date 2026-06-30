<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    closeDelay = undefined
  }: {
    closeDelay?: number
  } = $props()
</script>

<NavigationMenu.Root {closeDelay}>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

      <NavigationMenu.Content data-testid="popup-1">
        <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
        <NavigationMenu.Root>
          <NavigationMenu.List>
            <NavigationMenu.Item value="nested-item-1">
              <NavigationMenu.Trigger data-testid="nested-trigger-1">
                Nested Item 1
              </NavigationMenu.Trigger>
              <NavigationMenu.Content data-testid="nested-popup-1">
                <NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <NavigationMenu.Portal>
            <NavigationMenu.Positioner side="right" data-testid="nested-positioner">
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-2">
        <NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner data-testid="top-level-positioner">
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
