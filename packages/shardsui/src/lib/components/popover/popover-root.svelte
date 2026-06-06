<script lang="ts" generics="Payload = unknown">
  import { untrack, type Snippet } from 'svelte'
  import { PopoverRoot } from './popover.svelte'
  import { PopoverContext } from './context'
  import type { PopoverHandle } from './handle.svelte'

  type Props = {
    open?: boolean
    modal?: boolean | 'trap-focus'
    handle?: PopoverHandle<Payload>
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    triggerId?: string | null
    children?: Snippet<[{ payload: Payload | undefined }]>
  }

  let {
    open = $bindable(false),
    modal = false,
    handle,
    onOpenChange,
    onOpenChangeComplete,
    triggerId = $bindable(null),
    children
  }: Props = $props()

  const popover = untrack(() => (handle ? handle.state : new PopoverRoot<Payload>()))
  popover.attach(() => ({
    open,
    setOpen: (next) => {
      onOpenChange?.(next)
      open = next
    },
    modal,
    onOpenChangeComplete,
    triggerId,
    setTriggerId: (next) => {
      triggerId = next
    }
  }))

  PopoverContext.set(popover)
</script>

{@render children?.({ payload: popover.payload })}
