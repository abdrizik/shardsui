<script lang="ts">
  import { untrack } from 'svelte'
  import { Select } from '$lib/components/select'

  let {
    items = undefined,
    initialValue = 'sans'
  }: {
    items?: Record<string, unknown> | ReadonlyArray<{ value: unknown; label: unknown }>
    initialValue?: string | null
  } = $props()

  let value = $state<string | null>(untrack(() => initialValue))
</script>

<button onclick={() => (value = 'serif')}>serif</button>
<button onclick={() => (value = 'mono')}>mono</button>
<Select.Root {value} onValueChange={(v) => (value = v as string | null)} {items}>
  <Select.Trigger>
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="sans">Sans-serif</Select.Item>
        <Select.Item value="serif">Serif</Select.Item>
        <Select.Item value="mono">Monospace</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
