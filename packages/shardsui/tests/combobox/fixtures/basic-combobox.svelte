<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(),
    onValueChange,
    inputValue = $bindable(),
    onInputValueChange,
    open = $bindable(),
    onOpenChange,
    disabled = false,
    inputDisabled = false,
    readOnly = false,
    required = false,
    multiple = false,
    withTrigger = false,
    withDisabledItem = false,
    name,
    loopFocus = true,
    as = 'input',
    inputStyle,
    side,
    onInputCompositionStart,
    onTriggerPointerDown
  }: {
    value?: unknown
    onValueChange?: (value: unknown) => void
    inputValue?: string
    onInputValueChange?: (value: string) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    disabled?: boolean
    inputDisabled?: boolean
    readOnly?: boolean
    required?: boolean
    multiple?: boolean
    withTrigger?: boolean
    withDisabledItem?: boolean
    name?: string
    loopFocus?: boolean
    as?: 'input' | 'textarea'
    inputStyle?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    onInputCompositionStart?: (event: CompositionEvent) => void
    onTriggerPointerDown?: (event: PointerEvent) => void
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
