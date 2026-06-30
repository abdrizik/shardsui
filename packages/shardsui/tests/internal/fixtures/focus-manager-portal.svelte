<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children?: Snippet } = $props()

  function portal(element: HTMLElement) {
    element.ownerDocument.body.appendChild(element)
    return () => element.remove()
  }
</script>

<div data-shards-ui-portal {@attach portal}>
  {@render children?.()}
</div>
