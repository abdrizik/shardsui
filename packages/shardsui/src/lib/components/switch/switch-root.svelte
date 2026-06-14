<script lang="ts">
  import { dispatchClickWithModifiers } from '$lib/internal/dispatch-click-with-modifiers'
  import { FieldContext } from '$lib/components/field/context'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import {
    getFieldAriaInvalid,
    getFieldState,
    getFieldStateAttrs
  } from '$lib/components/field/field.svelte'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import { FormContext } from '$lib/components/form/context'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { FallbackAriaLabelledBy } from '$lib/internal/fallback-aria-labelled-by.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { visuallyHidden, visuallyHiddenInput } from '$lib/internal/visually-hidden'
  import { watch } from '$lib/internal/watch.svelte'
  import type { Attachment } from 'svelte/attachments'
  import { SwitchContext, type SwitchState } from './context'

  type Props = PartProps<[SwitchState], 'span'> & {
    as?: 'span' | 'button'
    checked?: boolean
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    value?: string
    form?: string
    onCheckedChange?: (checked: boolean) => void
  }

  let {
    as = 'span',
    ref = $bindable(null),
    id,
    checked = $bindable(false),
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    name: nameProp,
    value,
    form,
    onCheckedChange,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    onfocus,
    onblur,
    'aria-labelledby': ariaLabelledByProp,
    'aria-describedby': ariaDescribedByProp,
    children,
    ...rest
  }: Props = $props()

  let inputElement = $state<HTMLInputElement | null>(null)

  const uid = $props.id()

  const field = FieldContext.getOr()
  const labelable = LabelableContext.get()
  const formRoot = FormContext.getOr()

  const name = $derived(field?.name ?? nameProp)
  const disabled = $derived(field?.disabled || disabledProp)

  const rootId = $derived(as === 'button' ? (id ?? uid) : uid)
  const inputId = $derived(as === 'button' ? undefined : (id ?? `${uid}-input`))
  const ariaLabelledBy = new FallbackAriaLabelledBy(() => ({
    element: inputElement,
    elementId: inputId,
    ariaLabelledBy: ariaLabelledByProp,
    labelId: labelable.labelId
  }))

  const ariaDescribedBy = $derived(mergeDescribedBy(ariaDescribedByProp, labelable.messageIds))

  const ariaInvalid = $derived(getFieldAriaInvalid(field, disabled))

  const switchState = $derived({
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

  SwitchContext.set({
    get state() {
      return switchState
    },
    get stateAttrs() {
      return stateAttrs
    }
  })

  $effect(() => {
    if (!field || disabled) return
    return field.registerControl({
      id: uid,
      element: () => inputElement,
      value: () => checked,
      name: () => nameProp
    })
  })

  $effect(() => {
    if (field) field.filled = checked
  })

  watch(
    () => checked,
    (current) => {
      formRoot?.clearErrors(name)
      if (!field) return
      field.setDirty(current !== field.validityData.initialValue)
      field.commitValue(current)
    }
  )

  const publishControlId: Attachment = () => labelable.registerControlId(inputId ?? rootId)

  function forwardClickToInput(event: MouseEvent) {
    if (readOnly) return
    event.preventDefault()
    if (inputElement) dispatchClickWithModifiers(inputElement, event)
  }

  function onchange() {
    if (!inputElement) return

    if (readOnly) {
      inputElement.checked = checked
      return
    }

    const next = inputElement.checked
    onCheckedChange?.(next)
    checked = next
    if (checked !== next) inputElement.checked = checked
  }

  function focusRoot() {
    ref?.focus()
  }

  function markFieldFocused() {
    if (!disabled && field) field.focused = true
  }

  function commitFieldOnBlur() {
    if (!inputElement || disabled) return
    field?.commitOnBlur(inputElement.checked)
  }

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(onclick, forwardClickToInput),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach publishControlId}
  {@attach btn.attach}
  id={rootId}
  role="switch"
  aria-checked={checked}
  aria-readonly={readOnly || undefined}
  aria-required={required || undefined}
  aria-labelledby={ariaLabelledBy.value}
  aria-describedby={ariaDescribedBy}
  aria-invalid={ariaInvalid}
  onfocus={chain(onfocus, markFieldFocused)}
  onblur={chain(onblur, commitFieldOnBlur)}
  {...rest}
>
  {@render children?.(switchState)}
</svelte:element>

<input
  bind:this={inputElement}
  type="checkbox"
  id={inputId}
  {checked}
  {disabled}
  {form}
  {name}
  {required}
  {value}
  tabindex={-1}
  aria-hidden="true"
  style={name ? visuallyHiddenInput : visuallyHidden}
  {onchange}
  onclick={(event) => event.stopPropagation()}
  onfocus={focusRoot}
/>
