<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { handle } = $props()

  let nesting = $state(3)
</script>

<div>
  <button type="button" data-testid="set-0" onclick={() => (nesting = 0)}>nest 0</button>
  <button type="button" data-testid="set-1" onclick={() => (nesting = 1)}>nest 1</button>
  <button type="button" data-testid="set-2" onclick={() => (nesting = 2)}>nest 2</button>
  <button type="button" data-testid="set-3" onclick={() => (nesting = 3)}>nest 3</button>

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
</div>
