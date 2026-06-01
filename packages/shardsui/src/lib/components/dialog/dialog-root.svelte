<script lang="ts" generics="Payload = unknown">
  import { untrack, type Snippet } from 'svelte'
  import { DialogRoot } from './dialog.svelte'
  import { DialogContext } from './context'
  import type { DialogHandle } from './handle.svelte'

  type Props = {
    open?: boolean
    modal?: boolean | 'trap-focus'
    disablePointerDismissal?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    handle?: DialogHandle<Payload>
    triggerId?: string | null
    children?: Snippet<[{ payload: Payload | undefined }]>
  }

  let {
    open = $bindable(false),
    modal = true,
    disablePointerDismissal = false,
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
    modal,
    disablePointerDismissal,
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
