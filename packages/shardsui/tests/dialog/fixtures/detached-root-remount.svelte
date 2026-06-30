<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import type { DialogHandle } from '$lib/components/dialog/handle.svelte'

  let { handle }: { handle: DialogHandle<number> } = $props()
  let rootMounted = $state(true)
</script>

<button onclick={() => (rootMounted = !rootMounted)}>Toggle Root</button>
<Dialog.Trigger {handle} id="trigger" payload={1}>Trigger</Dialog.Trigger>

{#if rootMounted}
  <Dialog.Root {handle}>
    {#snippet children({ payload })}
      <span data-testid="payload">{payload ?? 'No payload'}</span>
      <Dialog.Portal>
        <Dialog.Popup>
          Dialog Content
          <Dialog.Close>Close</Dialog.Close>
          <button onclick={() => (rootMounted = false)}>Unmount Root</button>
        </Dialog.Popup>
      </Dialog.Portal>
    {/snippet}
  </Dialog.Root>
{/if}
