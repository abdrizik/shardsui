<script lang="ts">
  import FocusManagerDialog from './focus-manager-dialog.svelte'
</script>

<FocusManagerDialog triggerTestid="open-dialog">
  {#snippet children(close)}
    <FocusManagerDialog triggerTestid="open-nested-dialog">
      {#snippet children(closeNested)}
        <button
          data-testid="close-nested-dialog"
          aria-label="close-nested-dialog"
          onclick={closeNested}
        ></button>
      {/snippet}
    </FocusManagerDialog>
    <button data-testid="close-dialog" aria-label="close-dialog" onclick={close}></button>
  {/snippet}
</FocusManagerDialog>
