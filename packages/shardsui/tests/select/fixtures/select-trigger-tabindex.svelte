<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root>
  <Select.Trigger data-testid="trigger" tabindex={-1}>
    <Select.Value placeholder="Pick one" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">Option A</Select.Item>
        <Select.Item value="b">Option B</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
