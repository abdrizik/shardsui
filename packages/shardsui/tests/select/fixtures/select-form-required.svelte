<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    errors = undefined,
    required = false,
    matchError = false
  }: {
    errors?: Record<string, string | string[]>
    required?: boolean
    matchError?: boolean
  } = $props()
</script>

<Form {errors}>
  <Field.Root name="select" data-testid="field">
    <Select.Root {required}>
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
    {#if matchError}
      <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
    {:else}
      <Field.Error data-testid="error" />
    {/if}
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
