<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let value = $state<string | null>('item-1')
</script>

<NavigationMenu.Root bind:value>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger>
        Item 1
        <NavigationMenu.Icon data-testid="icon-1" />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger>
        Item 2
        <NavigationMenu.Icon data-testid="icon-2" />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
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
