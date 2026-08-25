<script lang="ts">
  import { ContextMenu } from '$lib/components/context-menu'
  import type { CollisionAvoidance } from '$lib/internal/floating/anchor-positioning.svelte'

  type Anchor = { getBoundingClientRect: () => DOMRect }

  let {
    open = true,
    collisionAvoidance = { side: 'flip' },
    anchor
  }: {
    open?: boolean
    collisionAvoidance?: CollisionAvoidance
    anchor?: Anchor
  } = $props()
</script>

<div style="position: fixed; bottom: 0; left: 0; right: 0; height: 50px;">
  <ContextMenu.Root {open}>
    <ContextMenu.Trigger data-testid="context-trigger">Surface</ContextMenu.Trigger>
    <ContextMenu.Portal>
      <ContextMenu.Positioner data-testid="positioner" {collisionAvoidance} {anchor}>
        <ContextMenu.Popup data-testid="context-popup" style="width: 150px; height: 100px;">
          <ContextMenu.Item>Action 1</ContextMenu.Item>
          <ContextMenu.Item>Action 2</ContextMenu.Item>
          <ContextMenu.Item>Action 3</ContextMenu.Item>
        </ContextMenu.Popup>
      </ContextMenu.Positioner>
    </ContextMenu.Portal>
  </ContextMenu.Root>
</div>
