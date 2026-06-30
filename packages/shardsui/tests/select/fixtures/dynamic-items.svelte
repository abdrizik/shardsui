<script lang="ts">
  import { untrack } from 'svelte'
  import { Select } from '$lib/components/select'

  let {
    initialValue = 'b'
  }: {
    initialValue?: string | null
  } = $props()

  let items = $state(['a', 'b', 'c'])
  let value = $state<string | null>(untrack(() => initialValue))
</script>

<button data-testid="remove-b" onclick={() => (items = items.filter((i) => i !== 'b'))}>
  Remove B
</button>
<button data-testid="remove-c" onclick={() => (items = items.filter((i) => i !== 'c'))}>
  Remove C
</button>

<Select.Root {value} onValueChange={(v) => (value = v as string | null)}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
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
