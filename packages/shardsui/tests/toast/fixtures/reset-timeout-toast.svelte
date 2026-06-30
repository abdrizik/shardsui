<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let toastId = $state<string | null>(null)

  function add() {
    toastId = manager.add({ title: 'title', timeout: 1000 })
  }

  function resetTimeout() {
    if (toastId) manager.update(toastId, { timeout: 1000 })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-button" onclick={add}>add</button>
  <button type="button" data-testid="reset-button" onclick={resetTimeout}>reset timeout</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
