<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let form = $state<ReturnType<typeof Form>>()
</script>

<Form bind:this={form}>
  <Field.Root name="username">
    <Field.Label>Username</Field.Label>
    <Field.Control data-testid="username" required />
    <Field.Error data-testid="username-error" />
  </Field.Root>
  <Field.Root name="email" validate={() => 'Invalid email'}>
    <Field.Label>Email</Field.Label>
    <Field.Control data-testid="email" />
    <Field.Error data-testid="email-error" />
  </Field.Root>
</Form>

<button type="button" data-testid="validate-all" onclick={() => form?.validate()}
  >Validate all</button
>
<button type="button" data-testid="validate-email" onclick={() => form?.validate('email')}
  >Validate email</button
>
