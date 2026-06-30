<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
  let count = $state(0)

  function addToast() {
    count += 1
    manager.add({ title: `toast-${count}` })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add" onclick={addToast}>add</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast}>
        <Toast.Content data-testid={`content-${toast.title}`}>
          <Toast.Title>{toast.title}</Toast.Title>
        </Toast.Content>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
