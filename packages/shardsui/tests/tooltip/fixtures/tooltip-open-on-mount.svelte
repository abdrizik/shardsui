<script lang="ts">
  import { untrack } from 'svelte'
  import type { TooltipHandle } from '$lib/components/tooltip/handle.svelte'

  let {
    handle,
    triggerId,
    onError
  }: { handle: TooltipHandle; triggerId: string; onError?: (error: unknown) => void } = $props()

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
