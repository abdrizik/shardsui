<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root multiple>
  <Select.Trigger>Trigger</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup data-testid="popup">
        <Select.List data-testid="list">
          <Select.Item value="1">Item 1</Select.Item>
          <Select.Item value="2">Item 2</Select.Item>
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
