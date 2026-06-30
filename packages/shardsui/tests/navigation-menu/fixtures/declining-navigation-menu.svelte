<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let { onValueChange = undefined }: { onValueChange?: (value: unknown) => void } = $props()
</script>

<NavigationMenu.Root bind:value={() => null, () => {}} {onValueChange}>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-1">
        <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
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
