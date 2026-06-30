<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    itemValue,
    onValueChange = undefined
  }: {
    itemValue: 0 | '' | false
    onValueChange?: (value: unknown) => void
  } = $props()
</script>

<NavigationMenu.Root {onValueChange}>
  <NavigationMenu.List>
    <NavigationMenu.Item value={itemValue}>
      <NavigationMenu.Trigger data-testid="trigger-0">Zero</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-0">
        <NavigationMenu.Link href="#link-0">Zero link</NavigationMenu.Link>
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
