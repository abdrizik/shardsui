<script lang="ts">
  import { Select } from '$lib/components/select'

  type Opt = { value: string; label: string; disabled?: boolean }

  let {
    items = [
      { value: 'a1', label: 'A1' },
      { value: 'a2', label: 'A2' }
    ] as Opt[],
    rootItems = undefined
  }: {
    items?: Opt[]
    rootItems?: Record<string, string>
  } = $props()

  let value = $state<string | null>(null)
</script>

<button data-testid="reset" onclick={() => (value = null)}>Reset</button>
<Select.Root {value} items={rootItems} onValueChange={(v) => (value = v as string | null)}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#each items as item (item.value)}
          <Select.Item value={item.value} disabled={item.disabled}>{item.label}</Select.Item>
        {/each}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
