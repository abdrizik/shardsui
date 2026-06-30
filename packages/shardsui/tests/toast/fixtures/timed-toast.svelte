<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    timeout = undefined,
    limit = 3,
    onClose = undefined,
    onRemove = undefined
  }: {
    timeout?: number
    limit?: number
    onClose?: () => void
    onRemove?: () => void
  } = $props()

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({
      title: 'Timed Toast',
      description: 'auto dismiss',
      timeout,
      onClose,
      onRemove
    })
  }
</script>

<Toast.Provider toastManager={manager} {timeout} {limit}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        {#if toast.description}
          <Toast.Description data-testid="description">{toast.description}</Toast.Description>
        {/if}
        <Toast.Close data-testid="close" aria-label="close">Close</Toast.Close>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
