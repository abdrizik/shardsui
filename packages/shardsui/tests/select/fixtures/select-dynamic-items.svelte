<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<string | null>(null),
    onValueChange = undefined
  }: {
    value?: string | null
    onValueChange?: (v: unknown) => void
  } = $props()

  let items = $state(['a', 'b', 'c'])
</script>

<button data-testid="remove-a" onclick={() => (items = items.filter((i) => i !== 'a'))}>
  Remove A
</button>
<button data-testid="remove-c" onclick={() => (items = items.filter((i) => i !== 'c'))}>
  Remove C
</button>
<button data-testid="reset" onclick={() => (items = ['a', 'b', 'c'])}>Reset</button>

<Select.Root {value} {onValueChange}>
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
