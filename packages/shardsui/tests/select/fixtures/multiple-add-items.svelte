<script lang="ts">
  import { Select } from '$lib/components/select'

  let { onValueChange = undefined }: { onValueChange?: (value: unknown) => void } = $props()

  let items = $state(['a', 'b'])
</script>

<Select.Root multiple bind:open={() => true, () => {}} value={['a']} {onValueChange}>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#each items as item (item)}
          <Select.Item value={item}>{item}</Select.Item>
        {/each}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
<button data-testid="add" onclick={() => (items = [...items, 'c'])}>Add C</button>
