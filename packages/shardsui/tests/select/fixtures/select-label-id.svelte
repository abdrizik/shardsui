<script lang="ts">
  import { Select } from '$lib/components/select'

  let { id = 'first', labelId = undefined }: { id?: string; labelId?: string } = $props()
</script>

<Select.Root {id}>
  <Select.Label data-testid="label" id={labelId}>Theme</Select.Label>
  <Select.Trigger data-testid="trigger" />
  <Select.Portal>
    <Select.Positioner />
  </Select.Portal>
</Select.Root>
