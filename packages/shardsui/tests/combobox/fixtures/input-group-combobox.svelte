<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Field } from '$lib/components/field'

  let {
    value = $bindable(),
    open = $bindable(),
    disabled = false,
    readOnly = false,
    openOnInputClick = undefined as boolean | undefined,
    withField = false,
    fieldDisabled = false
  } = $props()
</script>

{#snippet combobox()}
  <Combobox.Root {value} {open} {disabled} {readOnly} {openOnInputClick}>
    <Combobox.InputGroup data-testid="group">
      <span data-testid="pad">pad</span>
      <Combobox.Input data-testid="input" />
      <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
    </Combobox.InputGroup>
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List data-testid="list">
            <Combobox.Item value="apple">Apple</Combobox.Item>
            <Combobox.Item value="banana">Banana</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
{/snippet}

{#if withField}
  <Field.Root disabled={fieldDisabled}>
    {@render combobox()}
  </Field.Root>
{:else}
  {@render combobox()}
{/if}
