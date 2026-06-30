<script lang="ts">
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'

  let { validate }: { validate: () => string | null } = $props()

  let value = $state<string[]>([])
</script>

<Field.Root name="group" validationMode="onChange" {validate}>
  <CheckboxGroup {value} />
  <button type="button" onclick={() => (value = ['one'])}>Select</button>
</Field.Root>
