<script lang="ts">
  import { untrack } from 'svelte'
  import type { PreviewCardHandle } from '$lib/components/preview-card/handle.svelte'

  let {
    handle,
    triggerId,
    onError
  }: { handle: PreviewCardHandle; triggerId: string; onError?: (error: unknown) => void } = $props()

  $effect(() => {
    untrack(() => {
      try {
        handle.open(triggerId)
      } catch (error) {
        onError?.(error)
      }
    })
  })
</script>
