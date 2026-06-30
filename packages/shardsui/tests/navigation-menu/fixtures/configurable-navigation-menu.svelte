<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    rootAs = undefined,
    listAs = undefined,
    itemAs = undefined,
    triggerAs = undefined,
    iconAs = undefined,
    linkAs = undefined,
    positionerAs = undefined,
    popupAs = undefined,
    viewportAs = undefined,
    arrowAs = undefined,
    backdropAs = undefined
  }: {
    rootAs?: keyof HTMLElementTagNameMap
    listAs?: keyof HTMLElementTagNameMap
    itemAs?: keyof HTMLElementTagNameMap
    triggerAs?: keyof HTMLElementTagNameMap
    iconAs?: keyof HTMLElementTagNameMap
    linkAs?: keyof HTMLElementTagNameMap
    positionerAs?: keyof HTMLElementTagNameMap
    popupAs?: keyof HTMLElementTagNameMap
    viewportAs?: keyof HTMLElementTagNameMap
    arrowAs?: keyof HTMLElementTagNameMap
    backdropAs?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<NavigationMenu.Root as={rootAs} data-testid="root" value="item-1">
  <NavigationMenu.List as={listAs} data-testid="list">
    <NavigationMenu.Item as={itemAs} data-testid="item" value="item-1">
      <NavigationMenu.Trigger as={triggerAs} data-testid="trigger">
        Item 1
        <NavigationMenu.Icon as={iconAs} data-testid="icon" />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content data-testid="content">
        <NavigationMenu.Link as={linkAs} href="#link-1" data-testid="link"
          >Link 1</NavigationMenu.Link
        >
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal keepMounted>
    <NavigationMenu.Backdrop as={backdropAs} data-testid="backdrop" />
    <NavigationMenu.Positioner as={positionerAs} data-testid="positioner">
      <NavigationMenu.Popup as={popupAs} data-testid="popup">
        <NavigationMenu.Arrow as={arrowAs} data-testid="arrow" />
        <NavigationMenu.Viewport as={viewportAs} data-testid="viewport" />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
