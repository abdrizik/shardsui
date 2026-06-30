<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function addNoTitle() {
    manager.add({ timeout: 0 })
  }

  function addNoDescription() {
    manager.add({ title: 'has title', timeout: 0 })
  }

  function addWithTitle() {
    manager.add({ title: 'title', description: 'description', timeout: 0 })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-no-title" onclick={addNoTitle}>add no title</button>
  <button type="button" data-testid="add-no-desc" onclick={addNoDescription}>add no desc</button>
  <button type="button" data-testid="add-with-title" onclick={addWithTitle}>add with title</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title" />
        <Toast.Description data-testid="description" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
