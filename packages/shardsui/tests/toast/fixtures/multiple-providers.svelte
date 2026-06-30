<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager1 = new Toast.Manager()
  const manager2 = new Toast.Manager()

  let id1 = $state<string | null>(null)
  let id2 = $state<string | null>(null)
</script>

<Toast.Provider toastManager={manager1}>
  <Toast.Viewport data-testid="viewport-1">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root-1">
        <Toast.Title data-testid="title-1">{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
  <button
    type="button"
    data-testid="add-first"
    onclick={() => {
      id1 = manager1.add({ title: 'First toast', timeout: 0 })
    }}>add first</button
  >
  <button
    type="button"
    data-testid="update-first"
    onclick={() => {
      if (id1) manager1.update(id1, { title: 'First toast updated' })
    }}>update first</button
  >
</Toast.Provider>

<Toast.Provider toastManager={manager2}>
  <Toast.Viewport data-testid="viewport-2">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root-2">
        <Toast.Title data-testid="title-2">{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
  <button
    type="button"
    data-testid="add-second"
    onclick={() => {
      id2 = manager2.add({ title: 'Second toast', timeout: 0 })
    }}>add second</button
  >
  <button
    type="button"
    data-testid="update-second"
    onclick={() => {
      if (id2) manager2.update(id2, { title: 'Second toast updated' })
    }}>update second</button
  >
</Toast.Provider>
