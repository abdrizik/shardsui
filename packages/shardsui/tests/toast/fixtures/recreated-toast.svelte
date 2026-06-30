<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function addOne() {
    manager.add({ title: 'Toast 1', timeout: 0 })
  }
  function addThree() {
    manager.add({ title: 'Toast 1', timeout: 0 })
    manager.add({ title: 'Toast 2', timeout: 0 })
    manager.add({ title: 'Toast 3', timeout: 0 })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" onclick={addOne}>add one</button>
  <button type="button" onclick={addThree}>add three</button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts.map((t) => ({ ...t })) as toast (toast.id)}
      <Toast.Root {toast} data-testid="toast-root" data-id={toast.id}>
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Close data-testid="toast-close" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
