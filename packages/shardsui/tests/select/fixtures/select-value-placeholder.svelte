<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<unknown>(undefined),
    items = undefined,
    itemToStringValue = undefined,
    itemToStringLabel = undefined,
    placeholder = 'Select an option'
  }: {
    value?: unknown
    items?: readonly { label: unknown; value: unknown }[] | Record<string, unknown> | undefined
    itemToStringValue?: (item: unknown) => string
    itemToStringLabel?: (item: unknown) => string
    placeholder?: string
  } = $props()
</script>

<Select.Root {value} {items} {itemToStringValue} {itemToStringLabel}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" {placeholder} />
  </Select.Trigger>
</Select.Root>
