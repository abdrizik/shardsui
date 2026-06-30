<script lang="ts">
  import FocusManagerDialog from './focus-manager-dialog.svelte'

  let sideDialogOpen = $state(false)
</script>

<FocusManagerDialog modal={false} triggerTestid="open-dialog">
  {#snippet children(close)}
    <button data-testid="close-dialog" aria-label="close-dialog" onclick={close}></button>
    <button
      data-testid="open-nested-dialog"
      aria-label="open-nested-dialog"
      onclick={() => (sideDialogOpen = true)}
    ></button>
  {/snippet}
  {#snippet sideChildren()}
    <FocusManagerDialog modal open={sideDialogOpen}>
      {#snippet children(closeSide)}
        <button
          data-testid="close-nested-dialog"
          aria-label="close-nested-dialog"
          onclick={closeSide}
        ></button>
      {/snippet}
    </FocusManagerDialog>
  {/snippet}
</FocusManagerDialog>
