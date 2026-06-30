<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let { register = undefined }: { register?: (navigate: () => void) => void } = $props()

  let value = $state<unknown>(null)
  let aIsActive = $state(false)

  const navigate = () => {
    value = null
    aIsActive = true
  }

  $effect(() => {
    register?.(navigate)
  })
</script>

<NavigationMenu.Root bind:value>
  <NavigationMenu.List data-testid="list">
    <NavigationMenu.Item value="a">
      {#if aIsActive}
        <a href="#a">A active</a>
      {:else}
        <NavigationMenu.Trigger>A</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <NavigationMenu.Link href="#a">A link</NavigationMenu.Link>
        </NavigationMenu.Content>
      {/if}
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
