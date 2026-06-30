<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'

  let {
    fieldDisabled = false,
    fieldName = undefined
  }: {
    fieldDisabled?: boolean
    fieldName?: string
  } = $props()
</script>

<Field.Root disabled={fieldDisabled} name={fieldName}>
  <Select.Root>
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value="a">a</Select.Item>
          <Select.Item value="b">b</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</Field.Root>
