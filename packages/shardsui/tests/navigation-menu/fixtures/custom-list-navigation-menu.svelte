<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
</script>

<NavigationMenu.Root>
  <NavigationMenu.List as="div" data-testid="custom-list">
    <NavigationMenu.Item value="item">
      <NavigationMenu.Trigger data-testid="trigger-1">Trigger 1</NavigationMenu.Trigger>
      <NavigationMenu.Content>Content 1</NavigationMenu.Content>
    </NavigationMenu.Item>
    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-2">Trigger 2</NavigationMenu.Trigger>
      <NavigationMenu.Content>Content 2</NavigationMenu.Content>
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
