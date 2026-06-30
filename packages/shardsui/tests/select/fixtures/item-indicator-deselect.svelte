<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root multiple open value={['a']}>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">
          a
          <Select.ItemIndicator keepMounted data-testid="indicator" />
        </Select.Item>
        <Select.Item value="b">b</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
