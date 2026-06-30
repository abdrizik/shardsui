<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Popup data-testid="popup" />
</Select.Root>
