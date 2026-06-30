<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root name="auto" data-testid="field">
    <Autocomplete.Root required>
      <Autocomplete.Input data-testid="input" />
    </Autocomplete.Root>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
