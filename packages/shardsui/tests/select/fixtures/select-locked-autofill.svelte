<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    withField = false,
    disabled = false,
    readOnly = false,
    onValueChange = undefined
  }: {
    withField?: boolean
    disabled?: boolean
    readOnly?: boolean
    onValueChange?: (value: unknown) => void
  } = $props()
</script>

{#snippet select()}
  <Select.Root name={withField ? undefined : 'select'} {disabled} {readOnly} {onValueChange}>
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value="a">a</Select.Item>
          <Select.Item value="b">b</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
{/snippet}

{#if withField}
  <Form errors={{ select: 'test' }}>
    <Field.Root name="select">
      {@render select()}
      <Field.Error data-testid="error" />
    </Field.Root>
  </Form>
{:else}
  {@render select()}
{/if}
