<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import type { DialogHandle } from '$lib/components/dialog/handle.svelte'

  let {
    handle,
    phase = 'outgoing'
  }: { handle: DialogHandle; phase?: 'outgoing' | 'overlap' | 'incoming' } = $props()
</script>

{#if phase === 'outgoing' || phase === 'overlap'}
  <Dialog.Root {handle}>
    <Dialog.Portal>
      <Dialog.Popup>Outgoing</Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
{/if}

{#if phase === 'overlap' || phase === 'incoming'}
  <Dialog.Root {handle}>
    <Dialog.Portal>
      <Dialog.Popup>Incoming</Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
{/if}
