<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    onValueChange = undefined,
    open = $bindable(),
    onOpenChange = undefined,
    disabled = false,
    readOnly = false,
    required = false,
    name = undefined
  } = $props()
</script>

<Combobox.Root
  multiple
  {value}
  {onValueChange}
  {open}
  {onOpenChange}
  {disabled}
  {readOnly}
  {required}
  {name}
>
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
