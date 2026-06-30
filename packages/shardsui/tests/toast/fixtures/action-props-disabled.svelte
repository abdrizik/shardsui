<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  let clicks = $state(0)

  function add() {
    manager.add({
      title: 'Test',
      timeout: 0,
      actionProps: {
        disabled: true,
        children: 'Undo',
        'data-testid': 'action',
        onclick: () => (clicks += 1)
      }
    })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add" onclick={add}>add</button>
  <span data-testid="clicks">{clicks}</span>
  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast}>
        <Toast.Action />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
