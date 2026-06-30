<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let toastId = $state<string>('')

  function addToast() {
    toastId = manager.add({ title: 'Loading', description: 'Short' })
  }

  function updateToast() {
    if (!toastId) return
    manager.update(toastId, {
      title: 'Success',
      description: 'This content is longer than before and should cause the height to increase'
    })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <button type="button" data-testid="update-button" onclick={updateToast}>update</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="toast-root" style="width: 30px">
        <Toast.Content>
          <Toast.Title>{toast.title}</Toast.Title>
          <Toast.Description>{toast.description}</Toast.Description>
        </Toast.Content>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
