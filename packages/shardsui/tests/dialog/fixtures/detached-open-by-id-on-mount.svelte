<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import type { DialogHandle } from '$lib/components/dialog/handle.svelte'
  import MountAction from './mount-action.svelte'

  let { handle }: { handle: DialogHandle<number> } = $props()
</script>

<Dialog.Trigger {handle} id="other" payload={9}>Other</Dialog.Trigger>
<Dialog.Trigger {handle} id="trigger" payload={5}>Trigger</Dialog.Trigger>
<Dialog.Root {handle}>
  {#snippet children({ payload })}
    <span data-testid="payload">{payload ?? 'No payload'}</span>
    <Dialog.Portal>
      <Dialog.Popup>Dialog Content</Dialog.Popup>
    </Dialog.Portal>
  {/snippet}
</Dialog.Root>
<MountAction action={() => handle.open('trigger')} />
