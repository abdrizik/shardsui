<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(['a']),
    open = $bindable(),
    onOpenChange,
    readOnly = false,
    openOnInputClick
  }: {
    value?: string[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
    readOnly?: boolean
    openOnInputClick?: boolean
  } = $props()
</script>

<Combobox.Root
  multiple
  items={['a', 'b']}
  {value}
  {open}
  {onOpenChange}
  {readOnly}
  {openOnInputClick}
>
  <Combobox.InputGroup data-testid="group" style="padding: 10px">
    <Combobox.Chips>
      <Combobox.Chip data-testid="chip">a</Combobox.Chip>
      <Combobox.Input data-testid="input" />
    </Combobox.Chips>
  </Combobox.InputGroup>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List>
          <Combobox.Item value="a">a</Combobox.Item>
          <Combobox.Item value="b">b</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
