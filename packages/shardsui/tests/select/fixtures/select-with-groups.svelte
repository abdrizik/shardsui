<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root>
  <Select.Trigger data-testid="trigger">
    <Select.Value placeholder="Pick one" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Group>
          <Select.GroupLabel>Fruits</Select.GroupLabel>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
        </Select.Group>
        <Select.Group>
          <Select.GroupLabel>Vegetables</Select.GroupLabel>
          <Select.Item value="carrot">Carrot</Select.Item>
          <Select.Item value="spinach">Spinach</Select.Item>
        </Select.Group>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
