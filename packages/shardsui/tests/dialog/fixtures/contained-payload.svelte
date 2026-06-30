<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let payloads = $state([1, 2])
</script>

<Dialog.Root>
  {#snippet children({ payload })}
    <Dialog.Trigger id="trigger-1" payload={payloads[0]}>Trigger 1</Dialog.Trigger>
    <Dialog.Trigger id="trigger-2" payload={payloads[1]}>Trigger 2</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup data-testid="dialog-popup">
        <span data-testid="content">{payload}</span>
        <button type="button" onclick={() => (payloads = [8, 16])}>Update payloads</button>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  {/snippet}
</Dialog.Root>
