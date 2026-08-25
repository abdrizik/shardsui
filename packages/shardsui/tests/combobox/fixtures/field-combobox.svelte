<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'

  type FieldProps = ComponentProps<typeof Field.Root>

  let {
    disabled = false,
    invalid,
    name,
    validate,
    validationMode,
    required = false,
    multiple = false,
    value = $bindable(),
    open = $bindable(),
    inputInsidePopup = false,
    useComboboxLabel = false,
    triggerId,
    withLabel = false,
    withError = false
  }: {
    disabled?: boolean
    invalid?: boolean
    name?: string
    validate?: FieldProps['validate']
    validationMode?: FieldProps['validationMode']
    required?: boolean
    multiple?: boolean
    value?: unknown
    open?: boolean
    inputInsidePopup?: boolean
    useComboboxLabel?: boolean
    triggerId?: string
    withLabel?: boolean
    withError?: boolean
  } = $props()
</script>

<Field.Root {disabled} {invalid} {name} {validate} {validationMode}>
  {#if withLabel && !useComboboxLabel}
    <Field.Label data-testid="label">Search</Field.Label>
  {/if}
  <Combobox.Root {required} {multiple} {value} {open}>
    {#if useComboboxLabel}
      <Combobox.Label data-testid="label">Search</Combobox.Label>
    {/if}
    {#if !inputInsidePopup}
      <Combobox.Input data-testid="input" />
    {/if}
    <Combobox.Trigger data-testid="trigger" id={triggerId}>Open</Combobox.Trigger>
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          {#if inputInsidePopup}
            <Combobox.Input data-testid="input" />
          {/if}
          <Combobox.List>
            <Combobox.Item value="">Select</Combobox.Item>
            <Combobox.Item value="a">a</Combobox.Item>
            <Combobox.Item value="b">b</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
  {#if withError}
    <Field.Description data-testid="description" />
    <Field.Error data-testid="error" match />
  {/if}
</Field.Root>
