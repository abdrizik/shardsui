<script lang="ts">
  import { ScrollAreaContext } from '$lib/components/scroll-area/context'

  let { onRead }: { onRead: () => void } = $props()

  const scrollArea = ScrollAreaContext.get()

  $effect(() => {
    void scrollArea.cornerSize
    onRead()
  })
</script>
