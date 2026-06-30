<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let showNested = $state(true)
</script>

<div>
  <button type="button" onclick={() => (showNested = !showNested)}>toggle</button>
  <Dialog.Root>
    <Dialog.Trigger>Trigger 0</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup data-testid="popup0">
        {#if showNested}
          <Dialog.Root>
            <Dialog.Trigger>Trigger 1</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Popup data-testid="popup1">
                <Dialog.Close>Close 1</Dialog.Close>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        {/if}
        <Dialog.Close>Close 0</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</div>
