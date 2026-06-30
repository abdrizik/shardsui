<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()
</script>

<Toast.Provider toastManager={manager} limit={1}>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid={String(toast.title)}>
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
  <button
    type="button"
    data-testid="add-save"
    onclick={() => manager.add({ id: 'save', title: 'Saving...', timeout: 0 })}>add save</button
  >
  <button
    type="button"
    data-testid="add-other"
    onclick={() => manager.add({ id: 'other', title: 'Other toast', timeout: 0 })}>add other</button
  >
  <button
    type="button"
    data-testid="upsert-save"
    onclick={() => manager.add({ id: 'save', title: 'Saved', timeout: 0 })}>upsert save</button
  >
</Toast.Provider>
