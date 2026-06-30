<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Select } from '$lib/components/select'

  let value = $state<string | null>(null)
</script>

<Field.Root data-testid="root">
  <Select.Root bind:value>
    <Select.Trigger>trigger</Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value="a">a</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</Field.Root>
<button type="button" onclick={() => (value = 'a')}>set</button>
<button type="button" onclick={() => (value = null)}>clear</button>
