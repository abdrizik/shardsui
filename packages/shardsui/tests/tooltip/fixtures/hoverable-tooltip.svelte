<script lang="ts">
  import { Tooltip } from '$lib/components/tooltip'

  let { disableHoverablePopup = false }: { disableHoverablePopup?: boolean } = $props()
</script>

<div style="padding-top: 100px; padding-left: 100px;">
  <Tooltip.Root {disableHoverablePopup}>
    <Tooltip.Trigger delay={0} closeDelay={0} style="width: 120px; height: 40px;"
      >Trigger</Tooltip.Trigger
    >
    <Tooltip.Portal>
      <Tooltip.Positioner data-testid="positioner" side="bottom" sideOffset={0}>
        <Tooltip.Popup data-testid="popup" style="width: 120px; height: 40px;"
          >Content</Tooltip.Popup
        >
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
  <button type="button" data-testid="outside">Outside</button>
</div>
