<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  type FormProps = ComponentProps<typeof Form>
  type RootProps = ComponentProps<typeof Combobox.Root>

  let {
    onFormSubmit,
    onsubmit,
    errors,
    name = 'country',
    required = false,
    multiple = false,
    items,
    value = $bindable(),
    itemToStringLabel,
    itemToStringValue,
    withError = false,
    openOnInputClick
  }: {
    onFormSubmit?: FormProps['onFormSubmit']
    onsubmit?: FormProps['onsubmit']
    errors?: FormProps['errors']
    name?: string
    required?: boolean
    multiple?: boolean
    items?: RootProps['items']
    value?: RootProps['value']
    itemToStringLabel?: RootProps['itemToStringLabel']
    itemToStringValue?: RootProps['itemToStringValue']
    withError?: boolean
    openOnInputClick?: boolean
  } = $props()
</script>

<Form {onFormSubmit} {onsubmit} {errors}>
  <Field.Root {name}>
    <Combobox.Root
      {value}
      {required}
      {multiple}
      {openOnInputClick}
      {items}
      {itemToStringLabel}
      {itemToStringValue}
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
