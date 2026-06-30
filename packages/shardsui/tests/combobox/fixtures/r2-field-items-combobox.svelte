<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'

  type Option = { id: string; label: string }

  let {
    open = $bindable(),
    multiple = false,
    value = $bindable(),
    validate = undefined as ((value: unknown) => string | null) | undefined,
    validationMode = undefined as string | undefined,
    options = [
      { id: 'a', label: 'a' },
      { id: 'b', label: 'b' }
    ] as Option[],
    withSpanLabel = false,
    withInput = false
  } = $props()
</script>

<Field.Root validationMode={validationMode as never} validate={validate as never}>
  <Combobox.Root
    {open}
    {multiple}
    {value}
    items={options as never}
    itemToStringLabel={((item: Option) => item.label) as never}
    itemToStringValue={((item: Option) => item.id) as never}
    isItemEqualToValue={((item: Option, v: Option) => item.id === v.id) as never}
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
