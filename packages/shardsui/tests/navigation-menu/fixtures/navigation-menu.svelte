<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    value = $bindable(null),
    onValueChange = undefined,
    delay = undefined,
    closeDelay = undefined,
    keepMountedPortal = false,
    orientation = 'horizontal' as 'horizontal' | 'vertical'
  }: {
    value?: unknown
    onValueChange?: (value: unknown) => void
    delay?: number
    closeDelay?: number
    keepMountedPortal?: boolean
    orientation?: 'horizontal' | 'vertical'
  } = $props()
</script>

<NavigationMenu.Root bind:value {onValueChange} {delay} {closeDelay} {orientation}>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-1">
        <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
        <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="popup-2">
        <NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
        <NavigationMenu.Link href="#link-4">Link 4</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal keepMounted={keepMountedPortal}>
    <NavigationMenu.Positioner data-testid="top-level-positioner">
      <NavigationMenu.Popup data-testid="popup-root">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
