<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let showNested = $state(true)
</script>

<Dialog.Root>
  <Dialog.Trigger>Trigger 0</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="popup0">
      {#if showNested}
        <Dialog.Root>
          <Dialog.Trigger>nested trigger</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Popup />
          </Dialog.Portal>
        </Dialog.Root>
      {/if}
      <button type="button" onclick={() => (showNested = !showNested)}>toggle</button>
      <Dialog.Close>Close 0</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
