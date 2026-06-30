<script lang="ts">
  import { untrack } from 'svelte'
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let {
    initialValue = null,
    portalKeepMounted = false
  }: {
    initialValue?: string | null
    portalKeepMounted?: boolean
  } = $props()

  let value = $state<string | null>(untrack(() => initialValue))
</script>

<NavigationMenu.Root bind:value>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
      <NavigationMenu.Content keepMounted>
        <div style="width: 675px; height: 220px">Product panel</div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item value="item-2">
      <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
      <NavigationMenu.Content keepMounted>
        <div style="width: 500px; height: 180px">Learn panel</div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal keepMounted={portalKeepMounted}>
    <NavigationMenu.Positioner data-testid="positioner">
      <NavigationMenu.Popup data-testid="popup-root">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
