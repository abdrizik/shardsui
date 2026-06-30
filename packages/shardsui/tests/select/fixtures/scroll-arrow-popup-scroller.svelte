<script lang="ts">
  import { Select } from '$lib/components/select'

  let { labels = [] }: { labels?: string[] } = $props()
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">Open</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup data-testid="popup">
        <Select.ScrollUpArrow keepMounted data-testid="up" />
        {#each labels as label, i (i)}
          <Select.Item value={label}>{label}</Select.Item>
        {/each}
        <Select.ScrollDownArrow keepMounted data-testid="down" />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
