<script lang="ts">
  import { Select } from '$lib/components/select'

  let firstLabel = $state('Zebra')
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <button data-testid="rename" onclick={() => (firstLabel = 'Alpha one')}>rename</button>
        <Select.Item value="one">{firstLabel}</Select.Item>
        <Select.Item value="two">Alpha two</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
