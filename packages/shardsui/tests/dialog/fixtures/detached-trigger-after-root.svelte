<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import type { DialogHandle } from '$lib/components/dialog/handle.svelte'

  let { handle }: { handle: DialogHandle } = $props()
</script>

<Dialog.Root {handle}>
  <Dialog.Portal>
    <Dialog.Popup>Dialog Content</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
<Dialog.Trigger {handle} id="trigger">Trigger</Dialog.Trigger>
