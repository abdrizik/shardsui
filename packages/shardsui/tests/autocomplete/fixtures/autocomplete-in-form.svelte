<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'

  let {
    name = 'search',
    required = false,
    submitOnItemClick = false,
    onFormSubmit = undefined
  }: {
    name?: string
    required?: boolean
    submitOnItemClick?: boolean
    onFormSubmit?: (data: FormData) => void
  } = $props()

  let value = $state('')
  const allItems = ['alpha', 'alpine', 'beta']
  const filtered = $derived(
    value ? allItems.filter((item) => item.toLowerCase().includes(value.toLowerCase())) : allItems
  )
</script>

<form
  onsubmit={(e) => {
    e.preventDefault()
    onFormSubmit?.(new FormData(e.currentTarget))
  }}
>
  <Field.Root {name}>
    <Autocomplete.Root bind:value {required} {submitOnItemClick}>
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
    <Field.Error data-testid="error" match="valueMissing">required</Field.Error>
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</form>
