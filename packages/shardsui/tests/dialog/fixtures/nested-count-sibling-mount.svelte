<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let showSecond = $state(false)
</script>

<Dialog.Root>
  <Dialog.Trigger>Trigger 0</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="popup0">
      <Dialog.Root>
        <Dialog.Trigger>Trigger 1</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup data-testid="popup1" />
        </Dialog.Portal>
      </Dialog.Root>
      {#if showSecond}
        <Dialog.Root>
          <Dialog.Portal>
            <Dialog.Popup />
          </Dialog.Portal>
        </Dialog.Root>
      {/if}
      <button type="button" onclick={() => (showSecond = true)}>mount sibling</button>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
