<script lang="ts">
  import { untrack } from 'svelte'
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field, type FieldValidator } from '$lib/components/field'

  const allItems = ['Option 1', 'Option 2', 'Option 3']

  let {
    required = false,
    invalid = false,
    validate,
    validationMode = 'onBlur',
    value = ''
  }: {
    required?: boolean
    invalid?: boolean
    validate?: FieldValidator
    validationMode?: 'onBlur' | 'onChange' | 'onSubmit'
    value?: string
  } = $props()

  let inputValue = $state(untrack(() => value))
  const filtered = $derived(
    inputValue
      ? allItems.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
      : allItems
  )
</script>

<Field.Root {invalid} {validate} {validationMode}>
  <Autocomplete.Root bind:value={inputValue} {required}>
    <Autocomplete.Input data-testid="input" />
    <Autocomplete.Portal>
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {#each filtered as item (item)}
              <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
            {/each}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  </Autocomplete.Root>
  <Field.Label data-testid="label" as="span" />
  <Field.Description data-testid="description" />
  <Field.Error data-testid="error" />
</Field.Root>
