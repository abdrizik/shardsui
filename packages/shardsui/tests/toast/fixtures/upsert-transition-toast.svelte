<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({ id: 'save', title: 'Saving...', timeout: 0 })
  }

  function upsertToast() {
    manager.add({ id: 'save', title: 'Saved', timeout: 0, transitionStatus: 'ending' })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <button type="button" data-testid="upsert-button" onclick={upsertToast}>upsert</button>
  {#each Toast.getToastManager().toasts as toast (toast.id)}
    <div data-testid="title-value">{toast.title}</div>
    <div data-testid="transition-status">{toast.transitionStatus}</div>
  {/each}
</Toast.Provider>
