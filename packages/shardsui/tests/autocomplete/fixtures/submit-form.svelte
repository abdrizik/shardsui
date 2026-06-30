<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'

  let {
    name = 'q',
    items = ['alpha', 'alpine'],
    submitOnItemClick = false,
    openOnInputClick = false,
    onFormSubmit = undefined
  }: {
    name?: string
    items?: readonly string[]
    submitOnItemClick?: boolean
    openOnInputClick?: boolean
    onFormSubmit?: (data: FormData) => void
  } = $props()
</script>

<form
  onsubmit={(e) => {
    e.preventDefault()
    onFormSubmit?.(new FormData(e.currentTarget))
  }}
>
  <Field.Root {name}>
    <Autocomplete.Root {items} {submitOnItemClick} {openOnInputClick}>
      <Autocomplete.Input data-testid="input" />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.List data-testid="listbox">
              <Autocomplete.Collection>
                {#snippet children(item)}
                  <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
                {/snippet}
              </Autocomplete.Collection>
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</form>
