<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field, type FieldValidator } from '$lib/components/field'

  let {
    value = $bindable(),
    multiple = false,
    validationMode,
    validate,
    withEmptyItem = true
  }: {
    value?: unknown
    multiple?: boolean
    validationMode?: 'onBlur' | 'onChange' | undefined
    validate?: FieldValidator
    withEmptyItem?: boolean
  } = $props()
</script>

<Field.Root {validationMode} {validate}>
  <Select.Root {value} {multiple}>
    <Select.Trigger data-testid="trigger"></Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          {#if withEmptyItem}
            <Select.Item value="">Select</Select.Item>
          {/if}
          <Select.Item value="1">Option 1</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</Field.Root>
<button data-testid="outside">Outside</button>
