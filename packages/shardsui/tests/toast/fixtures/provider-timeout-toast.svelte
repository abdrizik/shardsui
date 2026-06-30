<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let { timeout = 5000 }: { timeout?: number } = $props()

  const manager = new Toast.Manager()
</script>

<Toast.Provider toastManager={manager} {timeout}>
  <button type="button" data-testid="add-button" onclick={() => manager.add({ title: 'test' })}
    >add</button
  >
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
