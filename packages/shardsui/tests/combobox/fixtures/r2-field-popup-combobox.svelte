<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'

  type FieldProps = ComponentProps<typeof Field.Root>

  let {
    validate,
    validationMode = 'onBlur'
  }: {
    validate?: FieldProps['validate']
    validationMode?: FieldProps['validationMode']
  } = $props()
</script>

<Field.Root {validationMode} {validate}>
  <Combobox.Root>
    <Combobox.Trigger data-testid="trigger" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.Input data-testid="input" />
          <Combobox.List data-testid="list">
            <Combobox.Item value="1">Option 1</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</Field.Root>
<button data-testid="outside">Outside</button>
