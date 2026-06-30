<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<unknown>(null),
    items = undefined,
    itemsArray = undefined,
    onValueChange = undefined
  }: {
    value?: unknown
    items?: Record<string, string> | undefined
    itemsArray?: Array<{ value: string; label: string }> | undefined
    onValueChange?: (v: unknown) => void
  } = $props()

  // This generic harness forwards an `unknown` value, so keep `Select.Root`'s
  // `Value` inference loose (`unknown`) rather than letting `items` pin it.
  const resolvedItems = $derived(
    (items ?? itemsArray) as
      | readonly { label: unknown; value: unknown }[]
      | Record<string, unknown>
      | undefined
  )
</script>

<Select.Root {value} {onValueChange} items={resolvedItems}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#if items}
          {#each Object.entries(items) as [v, label] (v)}
            <Select.Item value={v}>{label}</Select.Item>
          {/each}
        {:else if itemsArray}
          {#each itemsArray as item (item.value)}
            <Select.Item value={item.value}>{item.label}</Select.Item>
          {/each}
        {/if}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
