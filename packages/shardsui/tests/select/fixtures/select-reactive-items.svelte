<script lang="ts">
  import { Select } from '$lib/components/select'

  let value = $state<string | null>('a')
  let items = $state([
    { value: 'a', label: 'a' },
    { value: 'b', label: 'b' }
  ])

  function updateItems() {
    items = [
      { value: 'a', label: 'a new' },
      { value: 'b', label: 'b new' },
      { value: 'c', label: 'c' }
    ]
  }
</script>

<div>
  <button data-testid="update" onclick={updateItems}>update</button>
  <button data-testid="select-c" onclick={() => (value = 'c')}>select c</button>
  <Select.Root {value} onValueChange={(v) => (value = v as string | null)} {items}>
    <Select.Trigger>
      <Select.Value data-testid="value" />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          {#each items as item (item.value)}
            <Select.Item value={item.value}>{item.label}</Select.Item>
          {/each}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</div>
