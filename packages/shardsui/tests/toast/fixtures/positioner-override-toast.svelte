<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({
      id: 'overridden',
      title: 'title',
      timeout: 0,
      positionerProps: { side: 'bottom', align: 'end' }
    })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Positioner {toast} data-testid="positioner" side="left">
        <Toast.Root {toast}>
          <Toast.Title>{toast.title}</Toast.Title>
        </Toast.Root>
      </Toast.Positioner>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
