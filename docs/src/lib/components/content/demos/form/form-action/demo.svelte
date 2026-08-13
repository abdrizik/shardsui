<script lang="ts">
  import { Button } from '@shardsui/svelte/button'
  import { Field } from '@shardsui/svelte/field'
  import { Form, type FormErrors } from '@shardsui/svelte/form'

  let serverErrors = $state<FormErrors>({})
  let loading = $state(false)

  // Stands in for a SvelteKit form action in +page.server.ts submitted with use:enhance.
  async function submitForm(formData: FormData): Promise<FormErrors> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const username = formData.get('username')
    if (username === 'admin') {
      return { username: "'admin' is reserved. Choose another." }
    }
    return {}
  }
</script>

<Form
  method="POST"
  class="flex w-full max-w-64 flex-col gap-4"
  errors={serverErrors}
  onsubmit={async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    loading = true
    serverErrors = await submitForm(formData)
    loading = false
  }}
>
  <Field.Root name="username" class="flex flex-col items-start gap-1">
    <Field.Label class="text-sm font-semibold text-gray-900">Username</Field.Label>
    <Field.Control
      type="text"
      required
      value="admin"
      placeholder="e.g. alice132"
      class="h-8 w-full rounded-md border border-gray-200 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
    />
    <Field.Error class="text-sm text-red-800" />
  </Field.Root>
  <Button
    type="submit"
    disabled={loading}
    class="font-inherit m-0 flex h-8 items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm/6 font-normal text-nowrap text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-disabled:text-gray-500 hover:data-disabled:bg-gray-50"
  >
    Claim username
  </Button>
</Form>
