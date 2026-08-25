<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = ['sans', 'serif'],
    items = { sans: 'Sans-serif', serif: 'Serif' }
  }: {
    value?: unknown[]
    items?: Record<string, unknown>
  } = $props()
</script>

<Select.Root multiple {value} {items}>
  <Select.Value data-testid="value">Custom Multiple Text</Select.Value>
</Select.Root>
