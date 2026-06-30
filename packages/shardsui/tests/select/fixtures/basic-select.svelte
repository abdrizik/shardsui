<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable(),
    onValueChange = undefined,
    onOpenChange = undefined,
    open = $bindable(false),
    disabled = false,
    readOnly = false,
    required = false,
    name = undefined,
    placeholder = 'Pick one',
    items = undefined,
    itemToStringLabel = undefined,
    itemToStringValue = undefined
  } = $props()
</script>

<Select.Root
  {value}
  {onValueChange}
  {onOpenChange}
  {open}
  {disabled}
  {readOnly}
  {required}
  {name}
  {items}
  {itemToStringLabel}
  {itemToStringValue}
>
  <Select.Trigger>
    <Select.Value {placeholder} />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#if items && itemToStringLabel}
          {#each items as item, i (i)}
            <Select.Item value={item}>{itemToStringLabel(item)}</Select.Item>
          {/each}
        {:else}
          <Select.Item value="a">Option A</Select.Item>
          <Select.Item value="b">Option B</Select.Item>
          <Select.Item value="c">Option C</Select.Item>
        {/if}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
