<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    labels = ['One', 'Two', 'Three']
  }: {
    labels?: string[]
  } = $props()
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">Open</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.ScrollUpArrow keepMounted />
        <Select.List data-testid="list">
          {#each labels as label, i (i)}
            <Select.Item value={label}>{label}</Select.Item>
          {/each}
        </Select.List>
        <Select.ScrollDownArrow keepMounted />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
