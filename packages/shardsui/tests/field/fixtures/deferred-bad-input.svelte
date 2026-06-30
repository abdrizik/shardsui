<script lang="ts">
  import { Field } from '$lib/components/field'

  let { onValidity }: { onValidity: (data: unknown) => void } = $props()
</script>

<Field.Root validationMode="onBlur" validate={() => 'custom error'}>
  <Field.Control type="number" required data-testid="control" />
  <Field.Error match="valueMissing">Required</Field.Error>
  <Field.Error match="badInput">Invalid number</Field.Error>
  <Field.Validity>
    {#snippet children(data)}
      {onValidity(data)}
    {/snippet}
  </Field.Validity>
</Field.Root>
