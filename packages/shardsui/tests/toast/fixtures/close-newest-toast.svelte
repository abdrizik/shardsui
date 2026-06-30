<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let count = $state(0)
  let newestId = $state<string | null>(null)

  function addToast() {
    count += 1
    newestId = manager.add({ title: `toast-${count}` })
  }

  function closeNewest() {
    if (newestId) manager.close(newestId)
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <button type="button" data-testid="close-newest" onclick={closeNewest}>close newest</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title>{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
