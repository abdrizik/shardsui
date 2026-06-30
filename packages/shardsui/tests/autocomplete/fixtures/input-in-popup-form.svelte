<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'

  let {
    name = 'search',
    items = ['alpha', 'alpine'],
    value = undefined,
    submitOnItemClick = false,
    onFormSubmit = undefined
  }: {
    name?: string
    items?: readonly string[]
    value?: string
    submitOnItemClick?: boolean
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
    <Autocomplete.Root {items} {value} {submitOnItemClick}>
      <Autocomplete.Trigger data-testid="trigger">
        <Autocomplete.Value />
      </Autocomplete.Trigger>
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Input data-testid="input" />
            <Autocomplete.List>
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
