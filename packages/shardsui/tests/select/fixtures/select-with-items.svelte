<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable(),
    onValueChange = undefined,
    onOpenChange = undefined,
    name = undefined,
    items = undefined,
    itemToStringLabel = undefined,
    itemToStringValue = undefined,
    autoComplete = undefined,
    multiple = false,
    placeholder = 'Pick one'
  } = $props()
</script>

<Select.Root
  {value}
  {onValueChange}
  {onOpenChange}
  {name}
  {items}
  {itemToStringLabel}
  {itemToStringValue}
  {autoComplete}
  {multiple}
>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" {placeholder} />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup data-testid="popup">
        {#if items}
          {#each items as item, i (i)}
            <Select.Item value={item}
              >{itemToStringLabel ? itemToStringLabel(item) : String(item)}</Select.Item
            >
          {/each}
        {/if}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
