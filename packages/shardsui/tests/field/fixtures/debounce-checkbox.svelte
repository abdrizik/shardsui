<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'

  let { validate }: { validate: (value: unknown) => string | null } = $props()
</script>

<Field.Root validationDebounceTime={100} validationMode="onChange" {validate}>
  <Checkbox.Root />
  <Field.Error />
</Field.Root>
