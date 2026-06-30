<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'
  let {
    value = $bindable<unknown>(null),
    triggerId = undefined,
    withDescription = false,
    labelAs = 'label'
  }: {
    value?: unknown
    triggerId?: string
    withDescription?: boolean
    labelAs?: 'label' | 'span'
  } = $props()
</script>

<Field.Root>
  <Field.Label as={labelAs} data-testid="label">Font</Field.Label>
  <Select.Root {value}>
    <Select.Trigger data-testid="trigger" id={triggerId}>
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value="sans">Sans-serif</Select.Item>
          <Select.Item value="serif">Serif</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  {#if withDescription}
    <Field.Description data-testid="description">Pick a font</Field.Description>
  {/if}
</Field.Root>
