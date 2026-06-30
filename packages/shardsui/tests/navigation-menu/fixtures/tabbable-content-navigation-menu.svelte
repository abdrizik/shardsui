<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
</script>

<div>
  <NavigationMenu.Root>
    <NavigationMenu.List>
      <NavigationMenu.Item value="item">
        <NavigationMenu.Trigger>Trigger</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <button type="button">Action</button>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>

    <NavigationMenu.Portal>
      <NavigationMenu.Positioner>
        <NavigationMenu.Popup data-testid="popup">
          <NavigationMenu.Viewport />
        </NavigationMenu.Popup>
      </NavigationMenu.Positioner>
    </NavigationMenu.Portal>
  </NavigationMenu.Root>
  <button type="button">After menu</button>
</div>
