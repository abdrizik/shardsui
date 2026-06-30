<script lang="ts">
  import { Field } from '$lib/components/field'
  import type { FieldValidator } from '$lib/components/field/field.svelte'

  let { validate }: { validate: FieldValidator } = $props()
</script>

<Field.Root name="first" {validate} validationMode="onChange">
  <Field.Control data-testid="first" />
</Field.Root>

<Field.Root name="second">
  <Field.Control data-testid="second" value="second-value" />
</Field.Root>
