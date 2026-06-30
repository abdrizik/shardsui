<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { handle, nesting = 3 } = $props()
</script>

{#snippet trigger()}
  <Dialog.Trigger {handle}>Trigger</Dialog.Trigger>
{/snippet}

{#if nesting === 0}
  {@render trigger()}
{:else if nesting === 1}
  <div>{@render trigger()}</div>
{:else if nesting === 2}
  <div><div>{@render trigger()}</div></div>
{:else}
  <div><div><div>{@render trigger()}</div></div></div>
{/if}

<Dialog.Root {handle}>
  <Dialog.Portal>
    <Dialog.Popup>
      Dialog Content
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
