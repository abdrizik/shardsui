<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  function addToast() {
    manager.add({ title: 'Swipe me', timeout: 0 })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" onclick={addToast}>add toast</button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} swipeDirection="up" data-testid="toast-root">
        <div data-shards-ui-swipe-ignore="" data-testid="ignore-target">Ignore swipe</div>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
