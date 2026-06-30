<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import { on } from 'svelte/events'
  import type { Attachment } from 'svelte/attachments'

  let {
    onclick,
    onclickcapture,
    onancestorclick
  }: {
    onclick?: (event: MouseEvent) => void
    onclickcapture?: (event: MouseEvent) => void
    onancestorclick?: (event: MouseEvent) => void
  } = $props()

  const ancestor: Attachment<HTMLElement> = (node) =>
    on(node, 'click', (event) => onancestorclick?.(event))
</script>

<div {@attach ancestor}>
  <Toolbar.Root>
    <Toolbar.Button as="span" {onclick} {onclickcapture}>Save</Toolbar.Button>
  </Toolbar.Root>
</div>
