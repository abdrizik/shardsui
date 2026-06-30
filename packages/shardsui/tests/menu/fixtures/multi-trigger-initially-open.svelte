<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { detached = false }: { detached?: boolean } = $props()

  const handle = new Menu.Handle<number>()
</script>

{#snippet content(payload: unknown)}
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item data-testid="popup-content">{payload}</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
{/snippet}

{#if detached}
  <Menu.Trigger {handle} payload={1} id="trigger-1">Trigger 1</Menu.Trigger>
  <Menu.Trigger {handle} payload={2} id="trigger-2">Trigger 2</Menu.Trigger>
  <Menu.Root {handle} open triggerId="trigger-2">
    {#snippet children({ payload })}
      {@render content(payload)}
    {/snippet}
  </Menu.Root>
{:else}
  <Menu.Root open triggerId="trigger-2">
    {#snippet children({ payload })}
      <Menu.Trigger payload={1} id="trigger-1">Trigger 1</Menu.Trigger>
      <Menu.Trigger payload={2} id="trigger-2">Trigger 2</Menu.Trigger>
      {@render content(payload)}
    {/snippet}
  </Menu.Root>
{/if}
