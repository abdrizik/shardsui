<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'

  let {
    validate = undefined as ((value: unknown) => string | null) | undefined,
    validationMode = 'onBlur'
  } = $props()
</script>

<Field.Root validationMode={validationMode as never} validate={validate as never}>
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
