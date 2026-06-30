<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'
  let { active = false }: { active?: boolean } = $props()
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="#" {active} data-testid="active-link">link</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>
