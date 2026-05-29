<script lang="ts" generics="Payload = unknown">
  import { untrack, type Snippet } from 'svelte'
  import { PreviewCardRoot } from './preview-card.svelte'
  import { PreviewCardContext } from './context'
  import type { PreviewCardHandle } from './handle.svelte'

  type Props = {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    handle?: PreviewCardHandle<Payload>
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

  const previewCard = untrack(() => (handle ? handle.state : new PreviewCardRoot<Payload>()))
  previewCard.attach(() => ({
    open,
    setOpen: (next) => (open = next),
    onOpenChange,
    onOpenChangeComplete,
    triggerId,
    setTriggerId: (next) => {
      triggerId = next
    }
  }))

  PreviewCardContext.set(previewCard)
</script>

{@render children?.({ payload: previewCard.payload })}
