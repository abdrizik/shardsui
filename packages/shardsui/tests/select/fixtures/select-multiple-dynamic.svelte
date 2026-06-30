<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<string[]>(['a', 'c'])
  }: {
    value?: string[]
  } = $props()

  let items = $state(['a', 'b', 'c'])

  function removeItem(it: string) {
    items = items.filter((i) => i !== it)
  }
</script>

<div>
  <Select.Root multiple {value}>
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          {#each items as it (it)}
            <Select.Item value={it}>{it}</Select.Item>
          {/each}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  <button data-testid="remove-a" onclick={() => removeItem('a')}>Remove A</button>
  <button data-testid="remove-c" onclick={() => removeItem('c')}>Remove C</button>
</div>
