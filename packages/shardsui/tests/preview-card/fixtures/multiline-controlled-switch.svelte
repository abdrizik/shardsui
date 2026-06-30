<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let open = $state(false)
  let triggerId = $state<string | null>(null)
</script>

<div>
  <PreviewCard.Root
    {open}
    {triggerId}
    onOpenChange={(next) => {
      open = next
      if (!next) triggerId = null
    }}
  >
    <PreviewCard.Trigger
      href="#"
      id="trigger-1"
      data-testid="trigger-1"
      delay={0}
      style="display: inline;"
    >
      Trigger 1
    </PreviewCard.Trigger>
    <PreviewCard.Trigger
      href="#"
      id="trigger-2"
      data-testid="trigger-2"
      delay={0}
      style="display: inline;"
    >
      Trigger 2
    </PreviewCard.Trigger>
    <PreviewCard.Portal>
      <PreviewCard.Positioner data-testid="positioner" side="bottom" sideOffset={5}>
        <PreviewCard.Popup style="width: 80px; height: 40px;">Preview Content</PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  </PreviewCard.Root>

  <button
    type="button"
    onclick={() => {
      open = true
      triggerId = 'trigger-2'
    }}
  >
    Switch
  </button>
</div>
