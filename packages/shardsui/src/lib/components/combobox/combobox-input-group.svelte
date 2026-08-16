<script lang="ts">
  import { FieldContext } from '$lib/components/field/context'
  import { getFieldState, getFieldStateAttrs } from '$lib/components/field/field.svelte'
  import { attachElement } from '$lib/internal/attach-element'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { contains } from '$lib/internal/dom'
  import type { PartProps } from '$lib/internal/types'
  import { ComboboxContext, type ComboboxInputGroupState } from './context'
  import { focusInputOnPress } from './focus-input-on-press'

  type Props = PartProps<[ComboboxInputGroupState], 'div', 'onmousedown'>

  let { as = 'div', ref = $bindable(null), onmousedown, children, ...rest }: Props = $props()

  const combobox = ComboboxContext.get()
  const field = FieldContext.getOr()

  function onPress(event: MouseEvent) {
    focusInputOnPress(event, combobox, ref, (target) =>
      contains(combobox.chipsContainerElement, target)
    )
  }

  const comboboxState: ComboboxInputGroupState = $derived({
    ...getFieldState(field),
    open: combobox.open,
    disabled: combobox.disabled,
    readOnly: combobox.readOnly,
    popupSide: combobox.popupSide,
    listEmpty: combobox.isEmpty,
    placeholder: combobox.showsPlaceholder
  })

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': combobox.open,
      pressed: combobox.open,
      disabled: combobox.disabled,
      readonly: combobox.readOnly,
      'popup-side': combobox.popupSide ?? undefined,
      'list-empty': combobox.isEmpty,
      placeholder: combobox.showsPlaceholder,
      ...getFieldStateAttrs(field)
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach attachElement((el) => (combobox.inputGroupElement = el))}
  role="group"
  onmousedown={chain(onmousedown, onPress)}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
