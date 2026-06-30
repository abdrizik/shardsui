<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { handle } = $props()
</script>

<div>
  <Dialog.Trigger {handle} id="trigger1" payload={1}>Trigger 1</Dialog.Trigger>
  <Dialog.Trigger {handle} id="trigger2" payload={2}>Trigger 2</Dialog.Trigger>
  <Dialog.Root {handle}>
    {#snippet children({ payload })}
      <Dialog.Portal>
        <Dialog.Popup data-testid="dialog-popup">
          <span data-testid="content">{payload}</span>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    {/snippet}
  </Dialog.Root>
</div>
