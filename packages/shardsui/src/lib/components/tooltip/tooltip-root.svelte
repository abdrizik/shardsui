<script lang="ts" generics="Payload = unknown">
  import { untrack, type Snippet } from 'svelte'
  import { TooltipRoot } from './tooltip.svelte'
  import { TooltipContext } from './context'
  import type { TooltipHandle } from './handle.svelte'

  type Props = {
    open?: boolean
    disabled?: boolean
    disableHoverablePopup?: boolean
    trackCursorAxis?: 'none' | 'x' | 'y' | 'both'
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    handle?: TooltipHandle<Payload>
    triggerId?: string | null
    children?: Snippet<[{ payload: Payload | undefined }]>
  }

  let {
    open = $bindable(false),
    disabled = false,
    disableHoverablePopup = false,
    trackCursorAxis = 'none',
    onOpenChange,
    onOpenChangeComplete,
    handle,
    triggerId = $bindable(null),
    children
  }: Props = $props()

  const uid = $props.id()

  const tooltip = untrack(() => (handle ? handle.state : new TooltipRoot<Payload>()))
  tooltip.attach(() => ({
    open,
    setOpen: (next) => (open = next),
    disabled,
    disableHoverablePopup,
    trackCursorAxis,
    onOpenChange,
    onOpenChangeComplete,
    triggerId,
    setTriggerId: (next) => {
      triggerId = next
    },
    floatingId: uid
  }))

  TooltipContext.set(tooltip)
</script>

{@render children?.({ payload: tooltip.payload })}
