<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    timeout = 0
  }: {
    timeout?: number
  } = $props()

  const manager = new Toast.Manager()

  let firstId = $state<string>('')
  let secondId = $state<string>('')

  function addFirst() {
    firstId = manager.add({ id: 'save', title: 'Saving...', timeout })
  }

  function addSecond() {
    secondId = manager.add({ id: 'save', title: 'Saved', timeout })
  }

  function closeAll() {
    manager.close()
  }
</script>

<Toast.Provider toastManager={manager} {timeout}>
  <button type="button" data-testid="add-first" onclick={addFirst}>add first</button>
  <button type="button" data-testid="add-second" onclick={addSecond}>add second</button>
  <button type="button" data-testid="close-all" onclick={closeAll}>close all</button>
  <div data-testid="first-id">{firstId}</div>
  <div data-testid="second-id">{secondId}</div>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        {#if toast.description}
          <Toast.Description data-testid="description">{toast.description}</Toast.Description>
        {/if}
        <Toast.Close aria-label="close-press" />
        <div data-testid="update-key">{toast.updateKey}</div>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
