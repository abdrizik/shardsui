<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    limit = 2
  }: {
    limit?: number
  } = $props()

  const manager = new Toast.Manager()
  let count = $state(0)

  function addToast() {
    count += 1
    manager.add({ title: `toast-${count}`, timeout: 0 })
  }
</script>

<Toast.Provider toastManager={manager} {limit}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid={toast.title}>
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        <Toast.Close data-testid={`close-${toast.title}`} />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
