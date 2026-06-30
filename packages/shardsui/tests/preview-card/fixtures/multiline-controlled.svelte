<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  const sideOffset = 5

  let open = $state(false)
  let triggerId = $state<string | null>(null)
</script>

<div style="width: 140px;">
  <PreviewCard.Root
    {open}
    {triggerId}
    onOpenChange={(next) => {
      open = next
      if (!next) triggerId = null
    }}
  >
    <PreviewCard.Trigger
      delay={0}
      data-testid="trigger"
      id="trigger"
      style="display: inline; line-height: 20px;"
    >
      This is a long text that will wrap across multiple lines in the trigger element
    </PreviewCard.Trigger>
    <PreviewCard.Portal keepMounted>
      <PreviewCard.Positioner data-testid="positioner" side="bottom" {sideOffset}>
        <PreviewCard.Popup data-testid="popup" style="width: 80px; height: 40px;">
          Preview Content
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>

  <button
    type="button"
    onclick={() => {
      triggerId = 'trigger'
      open = true
    }}
  >
    Open
  </button>
  <button type="button" onclick={() => (open = false)}>Close</button>
</div>
