<script lang="ts">
  import { Select } from '$lib/components/select'

  let { onValueChange = undefined }: { onValueChange?: (value: unknown) => void } = $props()
</script>

<Select.Root {onValueChange}>
  <Select.Trigger data-testid="trigger">
    <Select.Value placeholder="Pick one" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">Option A</Select.Item>
        <Select.Item value="b" disabled={true}>Option B (disabled)</Select.Item>
        <Select.Item value="c">Option C</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
