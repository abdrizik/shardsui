<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    swipeDirection = ['down', 'right']
  }: {
    swipeDirection?: 'up' | 'down' | 'left' | 'right' | ('up' | 'down' | 'left' | 'right')[]
  } = $props()

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({ title: 'Swipe me', timeout: 0 })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" onclick={addToast}>add toast</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} {swipeDirection} data-testid="toast-root">
        <Toast.Title>{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
