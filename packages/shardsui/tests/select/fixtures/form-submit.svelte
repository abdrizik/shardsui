<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  type Item = { code: string; label: string }

  let {
    onFormSubmit = undefined
  }: {
    onFormSubmit?: (values: Record<string, unknown>) => void
  } = $props()

  const items: Item[] = [
    { code: 'US', label: 'United States' },
    { code: 'CA', label: 'Canada' }
  ]
</script>

<Form onFormSubmit={(values) => onFormSubmit?.(values)}>
  <Field.Root name="country">
    <Select.Root
      value={items[0]}
      itemToStringLabel={(item: Item) => item.label}
      itemToStringValue={(item: Item) => item.code}
    >
      <Select.Trigger>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            {#each items as item (item.code)}
              <Select.Item value={item}>{item.label}</Select.Item>
            {/each}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
