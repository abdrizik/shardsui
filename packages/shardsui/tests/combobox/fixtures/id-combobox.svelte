<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    id,
    open = $bindable(),
    inputInsidePopup = false,
    popupId
  }: {
    id?: string
    open?: boolean
    inputInsidePopup?: boolean
    popupId?: string
  } = $props()
</script>

<Combobox.Root {id} {open}>
  {#if !inputInsidePopup}
    <Combobox.Input data-testid="input" />
  {/if}
  <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup" id={popupId}>
        {#if inputInsidePopup}
          <Combobox.Input data-testid="input" />
        {/if}
        <Combobox.List>
          <Combobox.Item value="a">a</Combobox.Item>
          <Combobox.Item value="b">b</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
