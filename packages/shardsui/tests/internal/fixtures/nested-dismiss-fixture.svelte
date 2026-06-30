<script lang="ts">
  import type { DismissReason } from '$lib/internal/floating/dismiss.svelte'
  import DismissLayer from './dismiss-layer.svelte'

  type Bubbles = boolean | { escapeKey?: boolean; outsidePress?: boolean }

  type Props = {
    parentOutsidePress?: boolean
    childOutsidePress?: boolean
    parentBubbles?: Bubbles
    childBubbles?: Bubbles
    onParentDismiss?: (reason: DismissReason, event: Event) => void
    onChildDismiss?: (reason: DismissReason, event: Event) => void
  }

  let {
    parentOutsidePress = true,
    childOutsidePress = true,
    parentBubbles = undefined,
    childBubbles = undefined,
    onParentDismiss = undefined,
    onChildDismiss = undefined
  }: Props = $props()
</script>

<div>
  <DismissLayer
    testid="parent-popup"
    outsidePress={parentOutsidePress}
    bubbles={parentBubbles}
    onDismiss={onParentDismiss}
  >
    <DismissLayer
      testid="child-popup"
      outsidePress={childOutsidePress}
      bubbles={childBubbles}
      onDismiss={onChildDismiss}
    />
  </DismissLayer>
  <div data-testid="outside">Outside element</div>
</div>
