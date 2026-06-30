<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="apricot" disabled>apricot</Select.Item>
        <Select.Item value="avocado">avocado</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
