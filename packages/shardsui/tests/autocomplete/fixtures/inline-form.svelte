<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'

  let {
    name = 'search',
    items = ['alpha', 'alpine'],
    onFormSubmit = undefined
  }: {
    name?: string
    items?: readonly string[]
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
    <Autocomplete.Root {items} inline>
      <Autocomplete.Input data-testid="input" />
      <Autocomplete.List>
        <Autocomplete.Collection>
          {#snippet children(item)}
            <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
          {/snippet}
        </Autocomplete.Collection>
      </Autocomplete.List>
    </Autocomplete.Root>
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</form>
