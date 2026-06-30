<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { detached = false }: { detached?: boolean } = $props()

  const handle = new Menu.Handle<number>()

  let open = $state(false)
  let triggerId = $state<string | null>(null)

  function openWith(id: string) {
    triggerId = id
    open = true
  }
</script>

{#snippet content(payload: unknown)}
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item data-testid="content">{payload}</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
{/snippet}

<div>
  {#if detached}
    <Menu.Trigger {handle} payload={1} id="trigger-1">Trigger 1</Menu.Trigger>
    <Menu.Trigger {handle} payload={2} id="trigger-2">Trigger 2</Menu.Trigger>
    <Menu.Root {handle} bind:open {triggerId}>
      {#snippet children({ payload })}
        {@render content(payload)}
      {/snippet}
    </Menu.Root>
  {:else}
    <Menu.Root bind:open {triggerId}>
      {#snippet children({ payload })}
        <Menu.Trigger payload={1} id="trigger-1">Trigger 1</Menu.Trigger>
        <Menu.Trigger payload={2} id="trigger-2">Trigger 2</Menu.Trigger>
        {@render content(payload)}
      {/snippet}
    </Menu.Root>
  {/if}
  <button onclick={() => openWith('trigger-1')}>Open Trigger 1</button>
  <button onclick={() => openWith('trigger-2')}>Open Trigger 2</button>
  <button onclick={() => (open = false)}>Close</button>
</div>
