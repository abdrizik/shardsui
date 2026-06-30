<script lang="ts">
  import { PreviewCard } from '$lib/components/preview-card'

  let {
    triggerAs = undefined,
    backdropAs = undefined,
    positionerAs = undefined,
    popupAs = undefined,
    viewportAs = undefined,
    arrowAs = undefined
  }: {
    triggerAs?: keyof HTMLElementTagNameMap
    backdropAs?: keyof HTMLElementTagNameMap
    positionerAs?: keyof HTMLElementTagNameMap
    popupAs?: keyof HTMLElementTagNameMap
    viewportAs?: keyof HTMLElementTagNameMap
    arrowAs?: keyof HTMLElementTagNameMap
  } = $props()
</script>

<PreviewCard.Root open>
  <PreviewCard.Trigger as={triggerAs} data-testid="trigger">Link</PreviewCard.Trigger>
  <PreviewCard.Portal>
    <PreviewCard.Backdrop as={backdropAs} data-testid="backdrop" />
    <PreviewCard.Positioner as={positionerAs} data-testid="positioner">
      <PreviewCard.Popup as={popupAs} data-testid="popup">
        <PreviewCard.Viewport as={viewportAs} data-testid="viewport">Content</PreviewCard.Viewport>
        <PreviewCard.Arrow as={arrowAs} data-testid="arrow" />
      </PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
