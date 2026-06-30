<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    withField = false,
    disabled = false,
    readOnly = false,
    onValueChange = undefined,
    onInputValueChange = undefined
  }: {
    withField?: boolean
    disabled?: boolean
    readOnly?: boolean
    onValueChange?: (value: unknown) => void
    onInputValueChange?: (value: string) => void
  } = $props()
</script>

{#snippet combobox()}
  <Combobox.Root
    name={withField ? undefined : 'test'}
    {disabled}
    {readOnly}
    {onValueChange}
    {onInputValueChange}
  >
    <Combobox.Input data-testid="input" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List data-testid="list">
            <Combobox.Item value="a">a</Combobox.Item>
            <Combobox.Item value="b">b</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
{/snippet}

{#if withField}
  <Form errors={{ test: 'test' }}>
    <Field.Root name="test">
      {@render combobox()}
      <Field.Error data-testid="error" />
    </Field.Root>
  </Form>
{:else}
  {@render combobox()}
{/if}
