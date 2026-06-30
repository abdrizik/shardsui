<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import type { DialogHandle } from '$lib/components/dialog/handle.svelte'
  import MountAction from './mount-action.svelte'

  type Props = {
    handle: DialogHandle<number>
    open?: boolean
    action: () => void
  }

  let { handle, open = false, action }: Props = $props()
</script>

<Dialog.Root {handle} {open}>
  {#snippet children({ payload })}
    <span data-testid="payload">{payload ?? 'No payload'}</span>
    <MountAction {action} />
  {/snippet}
</Dialog.Root>
