<script lang="ts">
  import { Select } from '$lib/components/select'

  let { value = $bindable() } = $props()
</script>

<Select.Root {value}>
  <Select.Label data-testid="label">Font</Select.Label>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="sans">Sans-serif</Select.Item>
        <Select.Item value="serif">Serif</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
