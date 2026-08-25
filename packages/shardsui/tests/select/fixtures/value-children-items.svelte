<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = 'sans',
    items = [
      { value: 'sans', label: 'Sans-serif' },
      { value: 'serif', label: 'Serif' }
    ]
  }: {
    value?: unknown
    items?: ReadonlyArray<{ value: unknown; label: unknown }>
  } = $props()
</script>

<Select.Root {value} {items}>
  <Select.Value data-testid="value">
    {#snippet children(v)}Custom: {v}{/snippet}
  </Select.Value>
</Select.Root>
