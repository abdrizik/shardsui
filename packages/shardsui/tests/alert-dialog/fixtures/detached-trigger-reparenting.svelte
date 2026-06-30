<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let {
    handle,
    nesting = 0
  }: {
    handle: AlertDialog.Handle
    nesting?: 0 | 1 | 2 | 3
  } = $props()
</script>

{#snippet trigger()}
  <AlertDialog.Trigger {handle}>Trigger</AlertDialog.Trigger>
{/snippet}

{#if nesting === 0}
  {@render trigger()}
{:else if nesting === 1}
  <div>{@render trigger()}</div>
{:else if nesting === 2}
  <div>
    <div>{@render trigger()}</div>
  </div>
{:else}
  <div>
    <div>
      <div>{@render trigger()}</div>
    </div>
  </div>
{/if}

<AlertDialog.Root {handle}>
  <AlertDialog.Portal>
    <AlertDialog.Popup>
      <AlertDialog.Title>Alert dialog content</AlertDialog.Title>
      <AlertDialog.Close>Close</AlertDialog.Close>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
