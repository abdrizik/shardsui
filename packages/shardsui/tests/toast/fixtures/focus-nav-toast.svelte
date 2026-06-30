<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({ title: 'Test', description: 'desc', timeout: 0 })
  }
</script>

<Toast.Provider toastManager={manager}>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Close aria-label="close">Close</Toast.Close>
        <Toast.Action onclick={() => {}}>Action</Toast.Action>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
</Toast.Provider>
