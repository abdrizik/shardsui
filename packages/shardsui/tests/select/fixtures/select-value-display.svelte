<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable(null),
    onValueChange = undefined,
    items = undefined,
    itemToStringLabel = undefined,
    itemToStringValue = undefined,
    multiple = false,
    placeholder = undefined
  } = $props()
</script>

<Select.Root {value} {onValueChange} {items} {itemToStringLabel} {itemToStringValue} {multiple}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" {placeholder} />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup data-testid="popup">
        <Select.Item value="1">one</Select.Item>
        <Select.Item value="2">two</Select.Item>
        <Select.Item value="3">three</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
