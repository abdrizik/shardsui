<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    swipeDirection = ['down', 'right'],
    anchored = false
  }: {
    swipeDirection?: 'up' | 'down' | 'left' | 'right' | ('up' | 'down' | 'left' | 'right')[]
    anchored?: boolean
  } = $props()

  const manager = new Toast.Manager()

  function addToast() {
    const options: Parameters<typeof manager.add>[0] = {
      id: 'swipe-test-toast',
      title: 'Swipe Me',
      description: 'Swipe to dismiss'
    }
    if (anchored) {
      options.positionerProps = { anchor: document.createElement('div') }
    }
    manager.add(options)
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" onclick={addToast}>add toast</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} {swipeDirection} data-testid="toast-root">
        <Toast.Content data-testid="toast-content">
          <Toast.Title>{toast.title}</Toast.Title>
          <Toast.Description>{toast.description}</Toast.Description>
        </Toast.Content>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
