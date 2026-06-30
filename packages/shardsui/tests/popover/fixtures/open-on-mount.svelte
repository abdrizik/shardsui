<script lang="ts">
  import type { PopoverHandle } from '$lib/components/popover/handle.svelte'

  let { handle }: { handle: PopoverHandle } = $props()

  $effect(() => {
    handle.open('trigger')
  })
</script>
