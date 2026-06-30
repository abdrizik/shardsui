<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function add() {
    manager
      .promise(
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('success'), 1000)
        }),
        {
          loading: { description: 'loading', timeout: 0 },
          success: { description: 'success' },
          error: 'error'
        }
      )
      .catch(() => {})
  }
</script>

<Toast.Provider toastManager={manager} timeout={5000}>
  <button type="button" data-testid="add-button" onclick={add}>add</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Description data-testid="description">{toast.description ?? ''}</Toast.Description>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
