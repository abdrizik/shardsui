<script lang="ts">
  import { dispatchClickWithModifiers } from '$lib/internal/dispatch-click-with-modifiers'
  import { FieldItemContext, FieldContext } from '$lib/components/field/context'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import {
    getFieldAriaInvalid,
    getFieldState,
    getFieldStateAttrs
  } from '$lib/components/field/field.svelte'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import { RadioGroupContext } from '$lib/components/radio-group/context'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { CompositeItem } from '$lib/internal/floating/composite.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { FallbackAriaLabelledBy } from '$lib/internal/fallback-aria-labelled-by.svelte'
  import { serializeValue } from '$lib/internal/serialize-value'
  import type { PartProps } from '$lib/internal/types'
  import { visuallyHidden, visuallyHiddenInput } from '$lib/internal/visually-hidden'
  import type { Attachment } from 'svelte/attachments'
  import { RadioContext, type RadioState } from './context'

  type Props = PartProps<[RadioState], 'span', 'onclick' | 'onfocus' | 'onkeydown' | 'onkeyup'> & {
    as?: 'span' | 'button'
    value: unknown
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
  }

  let {
    as = 'span',
    ref = $bindable(null),
    id,
    value,
    disabled: disabledProp = false,
    readOnly: readOnlyProp = false,
    required: requiredProp = false,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    onfocus,
    'aria-labelledby': ariaLabelledByProp,
    'aria-describedby': ariaDescribedByProp,
    children,
    ...rest
  }: Props = $props()

  let inputElement = $state<HTMLInputElement | null>(null)

  const uid = $props.id()

  const group = RadioGroupContext.getOr()
  const field = FieldContext.getOr()
  const fieldItem = FieldItemContext.getOr()
  const labelable = LabelableContext.get()

  const rootId = $derived(as === 'button' ? (id ?? uid) : uid)
  const inputId = $derived(as === 'button' ? undefined : (id ?? `${uid}-input`))

  const disabled = $derived(
    field?.disabled || fieldItem?.disabled || group?.disabled || disabledProp
  )
  const readOnly = $derived(group?.readOnly || readOnlyProp)
  const required = $derived(group?.required || requiredProp)

  const checked = $derived(group ? group.value === value : value === '')
  const inputValue = $derived(value === undefined ? undefined : serializeValue(value))

  const item = group
    ? new CompositeItem(() => ({ composite: group.composite, ref, disabled, active: checked }))
    : undefined

  const ariaLabelledBy = new FallbackAriaLabelledBy(() => ({
    element: inputElement,
    elementId: inputId,
    ariaLabelledBy: ariaLabelledByProp,
    labelId: labelable.labelId
  }))

  const ariaDescribedBy = $derived(mergeDescribedBy(ariaDescribedByProp, labelable.messageIds))

  const ariaInvalid = $derived(getFieldAriaInvalid(field, disabled))

  const radioState = $derived({
    ...getFieldState(field),
    checked,
    disabled,
    readOnly,
    required
  })

  const stateAttrs = $derived(
    dataAttrs({
      checked,
      unchecked: !checked,
      disabled,
      readonly: readOnly,
      required,
      ...getFieldStateAttrs(field)
    })
  )

  RadioContext.set({
    get state() {
      return radioState
    },
    get stateAttrs() {
      return stateAttrs
    }
  })

  $effect(() => {
    if (field && inputElement?.checked) field.filled = true
  })

  const publishControlId: Attachment = () => labelable.registerControlId(inputId ?? rootId)

  const registerFieldInput: Attachment<HTMLInputElement> = (node) =>
    group && field ? field.registerInput(node, { control: () => ref, value: undefined }) : undefined

  function forwardClickToInput(event: MouseEvent) {
    if (event.defaultPrevented || readOnly) return
    event.preventDefault()
    if (inputElement) dispatchClickWithModifiers(inputElement, event)
  }

  function preventEnterActivation(event: KeyboardEvent) {
    if (event.key === 'Enter') event.preventDefault()
  }

  function checkOnFocus(event: FocusEvent) {
    if (event.defaultPrevented || disabled || readOnly || !group?.touched) return
    inputElement?.click()
    group.touched = false
  }

  function restoreInputs() {
    if (!inputElement) return
    inputElement.checked = checked

    const name = group?.name
    if (!name || group?.value === undefined) return

    const selected = serializeValue(group.value)
    for (const sibling of inputElement.ownerDocument.querySelectorAll<HTMLInputElement>(
      'input[type="radio"]'
    )) {
      if (sibling.name !== name || sibling.form !== inputElement.form) continue
      sibling.checked = sibling.value === selected
    }
  }

  function onchange() {
    if (!inputElement) return

    if (readOnly || value === undefined) {
      restoreInputs()
      return
    }

    group?.setCheckedValue(value)

    if (group && group.value !== value) {
      restoreInputs()
      return
    }

    if (field) field.setTouched(true)
  }

  function focusRoot() {
    ref?.focus()
  }

  const btn = new Button(() => ({
    disabled,
    as,
    tabindex: item?.tabindex,
    onclick: chain(onclick, forwardClickToInput),
    onmousedown,
    onkeydown: chain(onkeydown, preventEnterActivation),
    onkeyup,
    onpointerdown
  }))
</script>

<!-- svelte-ignore a11y_role_supports_aria_props -->
<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach publishControlId}
  {@attach btn.attach}
  id={rootId}
  role="radio"
  aria-checked={checked}
  aria-labelledby={ariaLabelledBy.value}
  aria-describedby={ariaDescribedBy}
  aria-invalid={ariaInvalid}
  onfocus={chain(onfocus, item?.onfocus, checkOnFocus)}
  {...rest}
>
  {@render children?.(radioState)}
</svelte:element>

<input
  bind:this={inputElement}
  {@attach registerFieldInput}
  type="radio"
  id={inputId}
  name={group?.name}
  form={group?.form}
  value={inputValue}
  {checked}
  {disabled}
  {required}
  tabindex={-1}
  aria-hidden="true"
  style={group?.name ? visuallyHiddenInput : visuallyHidden}
  {onchange}
  onclick={(event) => event.stopPropagation()}
  onfocus={focusRoot}
/>
