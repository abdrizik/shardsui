<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  const toast = { id: 'test', title: 'Toast title', description: 'Toast description' }

  let showLabels = $state(true)
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="hide" onclick={() => (showLabels = false)}>hide</button>
  <button type="button" data-testid="restore" onclick={() => (showLabels = true)}>restore</button>
  <Toast.Viewport data-testid="viewport">
    <Toast.Root {toast} data-testid="root">
      {#if showLabels}
        <Toast.Title data-testid="title" />
        <Toast.Description data-testid="description" />
      {/if}
    </Toast.Root>
  </Toast.Viewport>
</Toast.Provider>
