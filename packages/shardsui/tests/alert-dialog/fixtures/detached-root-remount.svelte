<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let { handle }: { handle: AlertDialog.Handle } = $props()
  let mounted = $state(true)
</script>

<div>
  <AlertDialog.Trigger {handle} id="trigger">Trigger</AlertDialog.Trigger>

  {#if !mounted}
    <button type="button" onclick={() => (mounted = true)}>Remount root</button>
  {/if}

  {#if mounted}
    <AlertDialog.Root {handle}>
      <AlertDialog.Portal>
        <AlertDialog.Popup>
          Alert dialog content
          <button type="button" onclick={() => (mounted = false)}>Unmount root</button>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  {/if}
</div>
