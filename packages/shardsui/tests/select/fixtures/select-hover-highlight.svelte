<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    open = $bindable(true),
    highlightItemOnHover = true,
    multiple = false
  }: {
    open?: boolean
    highlightItemOnHover?: boolean
    multiple?: boolean
  } = $props()
</script>

<Select.Root {open} {highlightItemOnHover} {multiple}>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner data-testid="positioner">
      <Select.Popup>
        <Select.Item value="a">a</Select.Item>
        <Select.Item value="b">b</Select.Item>
        <Select.Item value="c">c</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
