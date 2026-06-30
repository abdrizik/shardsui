<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
  let { closeOnClick = false }: { closeOnClick?: boolean } = $props()
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link href="#link-1" {closeOnClick} data-testid="link-1"
          >Link 1</NavigationMenu.Link
        >
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup data-testid="popup-1">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
