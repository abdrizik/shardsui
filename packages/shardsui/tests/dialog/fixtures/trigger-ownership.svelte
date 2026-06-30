<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let showSecondTrigger = $state(false)
</script>

<Dialog.Root modal={false}>
  <Dialog.Trigger id="trigger-1">Trigger 1</Dialog.Trigger>
  {#if showSecondTrigger}
    <Dialog.Trigger id="trigger-2">Trigger 2</Dialog.Trigger>
  {/if}
  <Dialog.Portal>
    <Dialog.Popup>
      <button type="button" onclick={() => (showSecondTrigger = true)}>Mount trigger 2</button>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
