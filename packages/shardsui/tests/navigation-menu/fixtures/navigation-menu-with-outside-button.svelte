<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    onValueChange = undefined,
    delay = undefined,
    closeDelay = undefined
  }: {
    onValueChange?: (value: unknown) => void
    delay?: number
    closeDelay?: number
  } = $props()
</script>

<button data-testid="first" aria-label="first"></button>
<NavigationMenu.Root {onValueChange} {delay} {closeDelay}>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <div data-testid="popup-1">
          <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
          <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <div data-testid="popup-2">
          <NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
          <NavigationMenu.Link href="#link-4">Link 4</NavigationMenu.Link>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner data-testid="top-level-positioner">
      <NavigationMenu.Popup data-testid="nav-popup">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
<button data-testid="last" aria-label="last"></button>
