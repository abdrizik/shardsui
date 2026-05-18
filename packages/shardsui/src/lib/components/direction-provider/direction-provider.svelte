<script lang="ts">
  import type { Snippet } from 'svelte'
  import { DirectionContext, type TextDirection } from '$lib/internal/direction-context'

  type Props = {
    direction?: TextDirection
    children?: Snippet
  }

  let { direction = 'ltr', children }: Props = $props()

  DirectionContext.set({
    get direction() {
      return direction
    }
  })
</script>

{@render children?.()}
