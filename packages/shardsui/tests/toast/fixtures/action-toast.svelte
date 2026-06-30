<script lang="ts">
  import { Toast } from '$lib/components/toast'

  const manager = new Toast.Manager()

  interface Props {
    onActionClick?: () => void
    actionDisabled?: boolean
  }

  let { onActionClick, actionDisabled = false }: Props = $props()

  function addWithAction() {
    manager.add({
      title: 'Test',
      timeout: 0,
      actionProps: {
        id: 'action',
        children: 'Undo',
        'data-testid': 'action',
        onclick: onActionClick
      }
    })
  }

  function addWithNoAction() {
    manager.add({
      title: 'Test',
      timeout: 0,
      actionProps: {
        children: undefined
      }
    })
  }
</script>

<Toast.Provider toastManager={manager}>
  <button type="button" data-testid="add-action" onclick={addWithAction}>add action</button>
  <button type="button" data-testid="add-no-action" onclick={addWithNoAction}>add no action</button>
  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        <Toast.Action disabled={actionDisabled} />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
