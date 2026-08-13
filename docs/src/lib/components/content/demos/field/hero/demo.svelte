<script lang="ts">
  import { Field } from '@shardsui/svelte/field'
</script>

<Field.Root class="flex w-full max-w-64 flex-col items-start gap-1">
  <Field.Label class="text-sm font-semibold text-gray-900">Group name</Field.Label>
  <Field.Control
    required
    placeholder="design-team"
    class="h-8 w-full rounded-md border border-gray-200 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
  />
  <Field.Error class="text-sm text-red-800" match="valueMissing">
    Please enter a group name
  </Field.Error>

  <Field.Description class="text-sm text-gray-600">
    Shown to everyone in the group
  </Field.Description>
</Field.Root>
