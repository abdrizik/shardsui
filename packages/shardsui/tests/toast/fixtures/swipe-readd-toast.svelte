<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
</script>

<Toast.Provider toastManager={manager}>
  <button
    type="button"
    data-testid="add"
    onclick={() => manager.add({ id: 'save', title: 'Saved', timeout: 0 })}
  >
    add
  </button>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} swipeDirection="right" data-testid="toast-root">
        <Toast.Title>{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>

<style>
  :global([data-testid='toast-root']) {
    opacity: 1;
    transition: opacity 10s;
  }

  :global([data-testid='toast-root'][data-ending-style]) {
    opacity: 0;
  }
</style>
