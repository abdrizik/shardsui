<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
  let toastId = $state<string>('')

  function addLoading() {
    toastId = manager.add({ title: 'loading', type: 'loading', timeout: 0 })
  }

  function updateToSuccess() {
    manager.update(toastId, { title: 'success', type: 'success', timeout: 1000 })
  }

  function doubleUpdate() {
    manager.update(toastId, { type: 'success', timeout: 1000 })
    manager.update(toastId, { title: 'new' })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-loading" onclick={addLoading}>add loading</button>
  <button type="button" data-testid="update-success" onclick={updateToSuccess}
    >update success</button
  >
  <button type="button" data-testid="double-update" onclick={doubleUpdate}>double update</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        <Toast.Close aria-label="close-press" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
