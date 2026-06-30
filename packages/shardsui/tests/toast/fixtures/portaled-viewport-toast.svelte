<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let { container }: { container: HTMLElement } = $props()

  const manager = new Toast.Manager()

  let newestId = $state<string | null>(null)

  function addToast() {
    newestId = manager.add({ title: 'title' })
  }

  function closeToast() {
    if (newestId) manager.close(newestId)
  }
</script>

<Toast.Provider toastManager={manager} timeout={0}>
  <button type="button" data-testid="add" onclick={addToast}>add alternate toast</button>
  <button type="button" data-testid="close" onclick={closeToast}>close alternate toast</button>
  <Toast.Portal {container}>
    <Toast.Viewport data-testid="alternate-viewport">
      {#each Toast.getToastManager().toasts as toast (toast.id)}
        <Toast.Root {toast} data-testid="root">
          <Toast.Title>{toast.title}</Toast.Title>
        </Toast.Root>
      {/each}
    </Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>
