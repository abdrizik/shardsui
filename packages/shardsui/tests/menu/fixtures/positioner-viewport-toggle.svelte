<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { viewport = false }: { viewport?: boolean } = $props()
</script>

<Menu.Root open>
  <Menu.Trigger as="div" style="width: 72px; height: 36px;">Trigger</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner data-testid="positioner">
      <Menu.Popup style="width: 52px; height: 24px;">
        {#if viewport}
          <Menu.Viewport>Popup</Menu.Viewport>
        {:else}
          Popup
        {/if}
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
