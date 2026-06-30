<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let {
    trigger1 = { top: 10, left: 10 },
    trigger2 = { top: 100, left: 200 }
  }: {
    trigger1?: { top: number; left: number }
    trigger2?: { top: number; left: number }
  } = $props()
</script>

<div>
  <PreviewCard.Root>
    {#snippet children({ payload })}
      <PreviewCard.Trigger
        href="#"
        payload={0}
        delay={0}
        data-testid="trigger1"
        style="position: absolute; top: {trigger1.top}px; left: {trigger1.left}px; width: 100px; height: 50px;"
      >
        Trigger 1
      </PreviewCard.Trigger>
      <PreviewCard.Trigger
        href="#"
        payload={1}
        delay={0}
        data-testid="trigger2"
        style="position: absolute; top: {trigger2.top}px; left: {trigger2.left}px; width: 100px; height: 50px;"
      >
        Trigger 2
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner>
          <PreviewCard.Popup>
            <PreviewCard.Viewport data-testid="viewport">
              <div data-testid="content">Content {payload}</div>
            </PreviewCard.Viewport>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    {/snippet}
  </PreviewCard.Root>
</div>
