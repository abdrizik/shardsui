<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    timeout = 5000,
    limit = 3
  }: {
    timeout?: number
    limit?: number
  } = $props()

  const manager = new Toast.Manager()

  let toastId = $state<string | null>(null)

  function addToast() {
    toastId = manager.add({ title: 'Test Toast', description: 'Toast description', timeout: 0 })
  }

  function addTitleOnly() {
    manager.add({ title: 'title', description: 'description', timeout: 0 })
  }

  function addWithType() {
    manager.add({ title: 'test', type: 'success', timeout: 0 })
  }

  function addHighPriority() {
    manager.add({ title: 'high priority', priority: 'high', timeout: 0 })
  }

  function closeToast(id?: string) {
    manager.close(id)
  }

  function updateToast(id: string, title: string) {
    manager.update(id, { title })
  }
</script>

<Toast.Provider toastManager={manager} {timeout} {limit}>
  <button type="button" data-testid="add-button" onclick={addToast}>add</button>
  <button type="button" data-testid="add-title" onclick={addTitleOnly}>add-title</button>
  <button type="button" data-testid="add-type" onclick={addWithType}>add-type</button>
  <button type="button" data-testid="add-high" onclick={addHighPriority}>add high</button>
  <button type="button" data-testid="close-button" onclick={() => closeToast(toastId ?? undefined)}
    >close</button
  >
  <button type="button" data-testid="close-all-button" onclick={() => closeToast()}
    >close-all</button
  >
  <button
    type="button"
    data-testid="update-button"
    onclick={() => toastId && updateToast(toastId, 'updated')}>update</button
  >
  <div data-testid="toast-count">{Toast.getToastManager().toasts.length}</div>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root" data-toast-id={toast.id}>
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        {#if toast.description}
          <Toast.Description data-testid="description">{toast.description}</Toast.Description>
        {/if}
        {#if toast.type}
          <span data-testid="type">{toast.type}</span>
        {/if}
        <Toast.Close aria-label="close-press" />
        <div data-testid="update-key">{toast.updateKey}</div>
        <div data-testid="transition-status">{toast.transitionStatus}</div>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
