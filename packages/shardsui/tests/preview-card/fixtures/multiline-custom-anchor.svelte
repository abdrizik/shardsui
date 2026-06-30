<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let triggerElement = $state<HTMLElement | null>(null)
  let portalContainer = $state<HTMLElement | null>(null)
</script>

<div>
  <div bind:this={portalContainer} data-testid="portal-container"></div>
  <PreviewCard.Root>
    <PreviewCard.Trigger bind:ref={triggerElement} href="#" delay={0} data-testid="trigger">
      Trigger
    </PreviewCard.Trigger>
    <PreviewCard.Portal container={portalContainer ?? undefined} keepMounted>
      <PreviewCard.Positioner
        anchor={triggerElement}
        collisionBoundary={{ x: 0, y: 0, width: 300, height: 120 }}
        collisionPadding={0}
        data-testid="positioner"
        side="bottom"
        sideOffset={5}
      >
        <PreviewCard.Popup style="width: 80px; height: 40px;">Preview Content</PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>
</div>
