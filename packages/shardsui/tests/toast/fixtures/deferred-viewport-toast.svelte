<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    onRemove = undefined
  }: {
    onRemove?: () => void
  } = $props()

  const manager = new Toast.Manager()
  let toastId = $state<string | null>(null)
  let showViewport = $state(false)

  function addToast() {
    toastId = manager.add({ id: 'save', title: 'Saving...', timeout: 0, onRemove })
  }

  function closeToast() {
    if (toastId) manager.close(toastId)
  }

  function reAddToast() {
    toastId = manager.add({ id: 'save', title: 'Saved', timeout: 0, onRemove })
  }

  function revealViewport() {
    showViewport = true
  }
</script>

<Toast.Provider toastManager={manager}>
  {#if showViewport}
    <Toast.Viewport data-testid="viewport">
      {#each Toast.getToastManager().toasts as toast (toast.id)}
        <Toast.Root {toast} data-testid="root">
          <Toast.Title data-testid="title">{toast.title}</Toast.Title>
          <Toast.Close aria-label="close-press" />
        </Toast.Root>
      {/each}
    </Toast.Viewport>
  {/if}
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <button type="button" data-testid="close-button" onclick={closeToast}>close</button>
  <button type="button" data-testid="re-add-button" onclick={reAddToast}>re-add</button>
  <button type="button" data-testid="show-viewport" onclick={revealViewport}>show viewport</button>
  <div data-testid="toast-count">{Toast.getToastManager().toasts.length}</div>
</Toast.Provider>
