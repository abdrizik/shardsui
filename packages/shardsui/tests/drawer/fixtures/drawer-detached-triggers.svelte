<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
  import type { DrawerHandle } from '$lib/components/drawer/handle.svelte'

  let { handle }: { handle: DrawerHandle<number> } = $props()
</script>

<div>
  <Drawer.Trigger {handle} payload={1}>Trigger 1</Drawer.Trigger>
  <Drawer.Trigger {handle} payload={2}>Trigger 2</Drawer.Trigger>
  <Drawer.Root {handle}>
    {#snippet children({ payload })}
      <Drawer.Portal>
        <Drawer.Viewport>
          <Drawer.Popup>
            {#if payload !== undefined}
              <span data-testid="payload">{payload}</span>
            {/if}
            <Drawer.Close>Close</Drawer.Close>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    {/snippet}
  </Drawer.Root>
</div>
