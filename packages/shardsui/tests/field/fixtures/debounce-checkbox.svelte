<script lang="ts">
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'

  let { validate }: { validate: FieldValidator } = $props()
</script>

<Field.Root validationDebounceTime={100} validationMode="onChange" {validate}>
  <Checkbox.Root />
  <Field.Error />
</Field.Root>
