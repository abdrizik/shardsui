<script lang="ts">
  import { Select } from '$lib/components/select'

  let items = $state(['b', 'c'])
  let reversed = $state(false)

  const ordered = $derived(reversed ? [...items].reverse() : items)
</script>

<Select.Root bind:open={() => true, () => {}} value="b">
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Group>
          <Select.GroupLabel>Group one</Select.GroupLabel>
          {#each ordered as itemValue (itemValue)}
            <Select.Item value={itemValue}>{itemValue}</Select.Item>
          {/each}
        </Select.Group>
        <Select.Group>
          <Select.GroupLabel>Group two</Select.GroupLabel>
          <Select.Item value="z">z</Select.Item>
        </Select.Group>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
<button data-testid="prepend" onclick={() => (items = ['a', ...items])}>Prepend</button>
<button data-testid="reverse" onclick={() => (reversed = !reversed)}>Reverse</button>
