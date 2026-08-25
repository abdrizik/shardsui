<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'

  type Option = { id: string; label: string }

  type FieldProps = ComponentProps<typeof Field.Root>

  let {
    open = $bindable(),
    multiple = false,
    value = $bindable(),
    validate,
    validationMode,
    options = [
      { id: 'a', label: 'a' },
      { id: 'b', label: 'b' }
    ],
    withSpanLabel = false,
    withInput = false
  }: {
    open?: boolean
    multiple?: boolean
    value?: Option | Option[] | null
    validate?: FieldProps['validate']
    validationMode?: FieldProps['validationMode']
    options?: Option[]
    withSpanLabel?: boolean
    withInput?: boolean
  } = $props()
</script>

<Field.Root {validationMode} {validate}>
  <Combobox.Root
    {open}
    {multiple}
    {value}
    items={options}
    itemToStringLabel={(item: Option) => item.label}
    itemToStringValue={(item: Option) => item.id}
    isItemEqualToValue={(item: Option, v: Option) => item.id === v.id}
  >
    {#if withInput}
      <Combobox.Input data-testid="input" />
    {/if}
    <Combobox.Trigger data-testid="trigger" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List data-testid="list">
            {#each options as option (option.id)}
              <Combobox.Item value={option}>{option.label}</Combobox.Item>
            {/each}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
  {#if withSpanLabel}
    <Field.Label data-testid="label" as="span" />
  {/if}
</Field.Root>
