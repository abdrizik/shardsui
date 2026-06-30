<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let { handle } = $props()

  let payloads = $state([1, 2])
</script>

<div>
  <div>
    <Dialog.Trigger id="trigger-1" payload={() => payloads[0]} {handle}>Dialog 1</Dialog.Trigger>
    <Dialog.Trigger id="trigger-2" payload={() => payloads[1]} {handle}>Dialog 2</Dialog.Trigger>
    <button type="button" onclick={() => (payloads = [8, 16])}>Update payloads</button>
  </div>
  <Dialog.Root {handle} modal={false} disablePointerDismissal={true}>
    {#snippet children({ payload })}
      <Dialog.Portal>
        <Dialog.Popup>
          <span data-testid="content">{(payload as (() => number) | undefined)?.()}</span>
        </Dialog.Popup>
      </Dialog.Portal>
    {/snippet}
  </Dialog.Root>
</div>
