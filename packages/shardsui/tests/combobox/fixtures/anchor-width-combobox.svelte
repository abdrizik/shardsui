<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    withInputGroup = false,
    inputWidth = 120,
    triggerWidth = 240,
    inputGroupWidth = 240,
    onAnchorWidth = undefined
  }: {
    withInputGroup?: boolean
    inputWidth?: number
    triggerWidth?: number
    inputGroupWidth?: number
    onAnchorWidth?: (width: number) => void
  } = $props()

  function sideOffset(data: { anchor: { width: number; height: number } }) {
    onAnchorWidth?.(data.anchor.width)
    return 0
  }
</script>

<Combobox.Root open>
  {#if withInputGroup}
    <Combobox.InputGroup data-testid="group" style="width: {inputGroupWidth}px;">
      <Combobox.Input data-testid="input" style="width: {inputWidth}px;" />
      <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
    </Combobox.InputGroup>
  {:else}
    <Combobox.Input data-testid="input" style="width: {inputWidth}px;" />
    <Combobox.Trigger data-testid="trigger" style="width: {triggerWidth}px;">Open</Combobox.Trigger>
  {/if}
  <Combobox.Portal>
    <Combobox.Positioner data-testid="positioner" {sideOffset}>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          <Combobox.Item value="One">One</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
