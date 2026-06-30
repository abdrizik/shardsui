<script lang="ts">
  import { Select } from '$lib/components/select'

  let { id = undefined }: { id?: string } = $props()
</script>

<Select.Root open>
  <Select.Group data-testid="group">
    <Select.GroupLabel {id}>Fruits</Select.GroupLabel>
  </Select.Group>
</Select.Root>
