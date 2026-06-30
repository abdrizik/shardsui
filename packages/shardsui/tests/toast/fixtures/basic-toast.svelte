<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({
      title: 'Test Toast',
      description: 'Toast description',
      timeout: 0
    })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-button" onclick={addToast}>Add Toast</button>

  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="toast-root">
        <Toast.Title data-testid="toast-title">{toast.title}</Toast.Title>
        {#if toast.description}
          <Toast.Description data-testid="toast-description">{toast.description}</Toast.Description>
        {/if}
        <Toast.Close data-testid="toast-close">Close</Toast.Close>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
