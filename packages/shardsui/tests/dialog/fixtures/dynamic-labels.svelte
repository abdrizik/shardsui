<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let phase = $state(0)
</script>

<Dialog.Root open modal={false}>
  <Dialog.Portal>
    <Dialog.Popup>
      {#if phase < 2}
        {#key phase}
          <Dialog.Title>Title {phase + 1}</Dialog.Title>
          <Dialog.Description>Description {phase + 1}</Dialog.Description>
        {/key}
      {/if}
      <button onclick={() => (phase += 1)}>Change labels</button>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
