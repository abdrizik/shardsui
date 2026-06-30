<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let open = $state(false)
  let triggerId = $state<string | null>(null)
</script>

<div>
  <Dialog.Root {open} {triggerId} onOpenChange={(next) => (open = next)}>
    {#snippet children({ payload })}
      <Dialog.Trigger id="trigger-1" payload={1}>One</Dialog.Trigger>
      <Dialog.Trigger id="trigger-2" payload={2}>Two</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Popup>
          <span data-testid="content">{payload}</span>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    {/snippet}
  </Dialog.Root>

  <button
    type="button"
    onclick={() => {
      triggerId = 'trigger-2'
      open = true
    }}
  >
    Open programmatically
  </button>
</div>
