<script lang="ts">
  import { Button } from '@shardsui/svelte/button'
  import { Field } from '@shardsui/svelte/field'
  import { Form, type FormErrors } from '@shardsui/svelte/form'
  import { z } from 'zod'

  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    questionCount: z.coerce
      .number('Count must be a number')
      .positive('Count must be a positive number')
  })

  function validate(formValues: Record<string, unknown>): FormErrors {
    const result = schema.safeParse(formValues)
    if (result.success) return {}

    const errors: FormErrors = {}
    for (const [name, messages] of Object.entries(z.flattenError(result.error).fieldErrors)) {
      if (messages) errors[name] = messages
    }
    return errors
  }

  let errors = $state<FormErrors>({})
</script>

<Form
  class="flex w-full max-w-64 flex-col gap-4"
  {errors}
  onFormSubmit={(formValues) => {
    errors = validate(formValues)
  }}
>
  {@render field('name', 'Name', 'My project')}
  {@render field('questionCount', 'Count', '10')}
  <Button
    type="submit"
    class="font-inherit m-0 flex h-8 items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm/6 font-normal text-nowrap text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-disabled:text-gray-500 hover:data-disabled:bg-gray-50"
  >
    Create
  </Button>
</Form>

{#snippet field(name: string, label: string, placeholder: string)}
  <Field.Root {name} class="flex flex-col items-start gap-1">
    <Field.Label class="text-sm font-semibold text-gray-900">{label}</Field.Label>
    <Field.Control
      {placeholder}
      class="h-8 w-full rounded-md border border-gray-200 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
    <Field.Error class="text-sm text-red-800" />
  </Field.Root>
{/snippet}
