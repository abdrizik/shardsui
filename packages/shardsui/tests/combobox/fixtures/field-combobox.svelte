<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'

  let {
    disabled = false,
    invalid = undefined as boolean | undefined,
    name = undefined as string | undefined,
    validate = undefined as ((value: unknown) => string | null) | undefined,
    validationMode = undefined as string | undefined,
    required = false,
    multiple = false,
    value = $bindable(),
    open = $bindable(),
    inputInsidePopup = false,
    useComboboxLabel = false,
    triggerId = undefined as string | undefined,
    withLabel = false,
    withError = false
  } = $props()
</script>

<Field.Root
  {disabled}
  {invalid}
  {name}
  validate={validate as never}
  validationMode={validationMode as never}
>
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
