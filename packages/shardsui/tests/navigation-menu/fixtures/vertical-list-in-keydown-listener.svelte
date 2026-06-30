<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let { onkeydown }: { onkeydown?: (event: KeyboardEvent) => void } = $props()
</script>

<div {onkeydown} role="presentation">
  <NavigationMenu.Root orientation="vertical">
    <NavigationMenu.List data-testid="list">
      <NavigationMenu.Item>
        <NavigationMenu.Trigger>Item</NavigationMenu.Trigger>
      </NavigationMenu.Item>
    </NavigationMenu.List>
  </NavigationMenu.Root>
</div>
