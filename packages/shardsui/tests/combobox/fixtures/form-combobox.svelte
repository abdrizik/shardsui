<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  type Item = Record<string, unknown>

  let {
    onFormSubmit = undefined,
    onsubmit = undefined,
    errors = undefined as Record<string, string> | undefined,
    name = 'country',
    required = false,
    multiple = false,
    items = undefined as Item[] | string[] | undefined,
    value = $bindable(),
    itemToStringLabel = undefined as ((item: unknown) => string) | undefined,
    itemToStringValue = undefined as ((item: unknown) => string) | undefined,
    withError = false,
    openOnInputClick = undefined as boolean | undefined
  } = $props()
</script>

<Form {onFormSubmit} {onsubmit} errors={errors as never}>
  <Field.Root {name}>
    <Combobox.Root
      {value}
      {required}
      {multiple}
      {openOnInputClick}
      items={items as never}
      itemToStringLabel={itemToStringLabel as never}
      itemToStringValue={itemToStringValue as never}
    >
      <Combobox.Input data-testid="input" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup data-testid="popup">
            <Combobox.List>
              {#if items}
                {#each items as item (itemToStringValue ? itemToStringValue(item) : String(item))}
                  <Combobox.Item value={item}>
                    {itemToStringLabel ? itemToStringLabel(item) : String(item)}
                  </Combobox.Item>
                {/each}
              {:else}
                <Combobox.Item value="a">a</Combobox.Item>
                <Combobox.Item value="b">b</Combobox.Item>
              {/if}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
    {#if withError}
      <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
    {/if}
    {#if errors}
      <Field.Error data-testid="error" />
    {/if}
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
