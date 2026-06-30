<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation-menu'

  type Props = { part: 'icon' | 'positioner' | 'arrow' }

  let { part }: Props = $props()
</script>

<NavigationMenu.Root value="one">
  {#if part === 'icon'}
    <NavigationMenu.Icon />
  {:else if part === 'positioner'}
    <NavigationMenu.Positioner />
  {:else}
    <NavigationMenu.Arrow />
  {/if}
</NavigationMenu.Root>
