<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    onValueChange = undefined,
    inputValue = $bindable(),
    onInputValueChange = undefined,
    open = $bindable(),
    onOpenChange = undefined,
    disabled = false,
    inputDisabled = false,
    readOnly = false,
    required = false,
    multiple = false,
    withTrigger = false,
    withDisabledItem = false,
    name = undefined,
    loopFocus = true,
    as = 'input' as 'input' | 'textarea',
    inputStyle = undefined as string | undefined,
    side = undefined as 'top' | 'right' | 'bottom' | 'left' | undefined,
    onInputCompositionStart = undefined as ((event: CompositionEvent) => void) | undefined,
    onTriggerPointerDown = undefined as ((event: PointerEvent) => void) | undefined
  } = $props()
</script>

<Combobox.Root
  {value}
  {onValueChange}
  {inputValue}
  {onInputValueChange}
  {open}
  {onOpenChange}
  {disabled}
  {readOnly}
  {required}
  {multiple}
  {name}
  {loopFocus}
>
  <Combobox.Input
    {as}
    disabled={inputDisabled}
    data-testid="input"
    placeholder="Search..."
    style={inputStyle}
    oncompositionstart={onInputCompositionStart}
  />
  {#if withTrigger}
    <Combobox.Trigger data-testid="trigger" onpointerdown={onTriggerPointerDown}>
      Open
    </Combobox.Trigger>
  {/if}
  <Combobox.Portal>
    <Combobox.Positioner {side}>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          <Combobox.Item value="apple">Apple</Combobox.Item>
          <Combobox.Item value="banana">Banana</Combobox.Item>
          <Combobox.Item value="cherry" disabled={withDisabledItem}>Cherry</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
