<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable(null),
    onValueChange
  }: {
    value?: unknown
    onValueChange?: (value: unknown) => void
  } = $props()
</script>

<Select.Root {value} {onValueChange}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">a</Select.Item>
        <Select.Item value="b">b</Select.Item>
        <Select.Item value="c">c</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
