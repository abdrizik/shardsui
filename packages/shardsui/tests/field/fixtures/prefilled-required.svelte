<script lang="ts">
  import { Field } from '$lib/components/field'
</script>

<Field.Root validationMode="onChange">
  <Field.Control data-testid="control" value="value" required />
  <Field.Error match="valueMissing">Required</Field.Error>
</Field.Root>
