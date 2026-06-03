<script lang="ts" generics="Payload = unknown">
  import { untrack, type Snippet } from 'svelte'
  import { DialogRoot } from '$lib/components/dialog/dialog.svelte'
  import { DialogContext } from '$lib/components/dialog/context'
  import type { AlertDialogHandle } from './handle.svelte'

  type Props = {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    handle?: AlertDialogHandle<Payload>
    triggerId?: string | null
    children?: Snippet<[{ payload: Payload | undefined }]>
  }

  let {
    open = $bindable(false),
    onOpenChange,
    onOpenChangeComplete,
    handle,
    triggerId = $bindable(null),
    children
  }: Props = $props()

  const dialog = untrack(() => (handle ? handle.state : new DialogRoot<Payload>()))
  dialog.attach(() => ({
    open,
    setOpen: (next) => {
      onOpenChange?.(next)
      open = next
    },
    modal: true,
    disablePointerDismissal: true,
    role: 'alertdialog',
    onOpenChangeComplete,
    triggerId,
    setTriggerId: (next) => {
      triggerId = next
    },
    detachedRoot: handle?.state
  }))

  DialogContext.set(dialog)
</script>

{@render children?.({ payload: dialog.payload })}
