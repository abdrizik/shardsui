<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    autoHighlight = false,
    highlightItemOnHover = true,
    onItemHighlighted = undefined,
    open = $bindable()
  } = $props()
</script>

<Combobox.Root {autoHighlight} {highlightItemOnHover} {onItemHighlighted} {open}>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          <Combobox.Item value="apple">Apple</Combobox.Item>
          <Combobox.Item value="banana">Banana</Combobox.Item>
          <Combobox.Item value="cherry">Cherry</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
