<script lang="ts">
  import { dispatchClickWithModifiers } from '$lib/internal/dispatch-click-with-modifiers'
  import { CheckboxGroupContext } from '$lib/components/checkbox-group/context'
  import { FieldItemContext, FieldContext } from '$lib/components/field/context'
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
  import { makeEventPreventable } from '$lib/internal/event-preventable'
  import { FallbackAriaLabelledBy } from '$lib/internal/fallback-aria-labelled-by.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { visuallyHidden, visuallyHiddenInput } from '$lib/internal/visually-hidden'
  import { watch } from '$lib/internal/watch.svelte'
  import type { Attachment } from 'svelte/attachments'
  import { CheckboxContext, type CheckboxState } from './context'

  type Props = PartProps<
    [CheckboxState],
    'span',
    'onblur' | 'onclick' | 'onfocus' | 'onkeydown' | 'onkeyup'
  > & {
    as?: 'span' | 'button'
    checked?: boolean
    disabled?: boolean
    indeterminate?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    form?: string
    value?: string
    onCheckedChange?: (checked: boolean) => void
  }

  let {
    as = 'span',
    ref = $bindable(null),
    id,
    checked: checkedProp = $bindable(false),
    disabled: disabledProp = false,
    indeterminate = false,
    readOnly = false,
    required = false,
    name: nameProp,
    form,
    value: valueProp,
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

  const group = CheckboxGroupContext.getOr()
  const field = FieldContext.getOr()
  const fieldItem = FieldItemContext.getOr()
  const labelable = LabelableContext.get()
  const formRoot = FormContext.getOr()

  const name = $derived(field?.name ?? nameProp)
  const value = $derived(valueProp ?? name)
  const disabled = $derived(
    field?.disabled || fieldItem?.disabled || group?.disabled || disabledProp
  )

  // Always set: Chrome warns about a form field with no `id` or `name`.
  const rootId = $derived(as === 'button' ? id || uid : uid)
  const inputId = $derived(as === 'button' ? undefined : id || `${uid}-input`)

  const checked = $derived(group && value !== undefined ? group.value.includes(value) : checkedProp)

  const ariaLabelledBy = new FallbackAriaLabelledBy(() => ({
    element: inputElement,
    elementId: inputId,
    ariaLabelledBy: ariaLabelledByProp,
    labelId: labelable.labelId
  }))

  const ariaDescribedBy = $derived(mergeDescribedBy(ariaDescribedByProp, labelable.messageIds))

  const ariaInvalid = $derived(getFieldAriaInvalid(field, disabled))

  const checkboxState = $derived({
    ...getFieldState(field),
    checked,
    disabled,
    readOnly,
    required,
    indeterminate
  })

  const stateAttrs = $derived(
    dataAttrs({
      checked: !indeterminate && checked,
      unchecked: !indeterminate && !checked,
      indeterminate,
      disabled,
      readonly: readOnly,
      required,
      ...getFieldStateAttrs(field)
    })
  )

  CheckboxContext.set({
    get state() {
      return checkboxState
    },
    get stateAttrs() {
      return stateAttrs
    }
  })

  $effect(() => {
    if (checked && field) field.filled = true
  })

  $effect(() => {
    if (!ref || group || !field || disabled) return
    const rootElement = ref
    return field.registerControl({
      id: rootId,
      element: () => inputElement ?? rootElement,
      value: () => checked,
      name: () => nameProp
    })
  })

  watch(
    () => checkedProp,
    (current) => {
      if (group) return

      formRoot?.clearErrors(name)
      if (!field) return
      field.setDirty(current !== field.validityData.initialValue)
      field.filled = current
      field.commitValue(current)
    }
  )

  const publishControlId: Attachment = () => labelable.registerControlId(inputId ?? rootId)

  const registerFieldInput: Attachment<HTMLInputElement> = (node) => {
    return field?.registerInput(node, {
      control: () => ref,
      value: group ? value : undefined
    })
  }

  function forwardClickToInput(event: MouseEvent) {
    if (readOnly) return
    event.preventDefault()
    if (inputElement) dispatchClickWithModifiers(inputElement, event)
  }

  function getDefaultFormSubmitter(formElement: HTMLFormElement | null) {
    if (!formElement) return null

    for (const candidate of formElement.elements) {
      if (!(candidate instanceof HTMLButtonElement) && !(candidate instanceof HTMLInputElement))
        continue
      if (candidate.type === 'submit') return candidate
    }

    return null
  }

  function submitFormOnEnter(event: KeyboardEvent) {
    if (event.key !== 'Enter') return

    makeEventPreventable(event).preventShardsUIHandler()

    if (event.defaultPrevented) return

    const inputForm = inputElement?.form ?? null
    const preventDefault = event.preventDefault.bind(event)
    let preventedDuringPropagation = false

    event.preventDefault = () => {
      preventedDuringPropagation = true
      preventDefault()
    }

    preventDefault()

    const win = ref?.ownerDocument.defaultView ?? window
    win.queueMicrotask(() => {
      Reflect.deleteProperty(event, 'preventDefault')
      if (!preventedDuringPropagation) getDefaultFormSubmitter(inputForm)?.click()
    })
  }

  function onchange() {
    if (!inputElement) return

    if (readOnly) {
      inputElement.checked = checked
      return
    }

    const next = inputElement.checked

    onCheckedChange?.(next)

    if (group && value !== undefined) {
      group.toggleChild(value, next)
    } else {
      checkedProp = next
    }

    if (checked !== next) inputElement.checked = checked
  }

  function focusRoot() {
    ref?.focus()
  }

  function markFieldFocused() {
    if (!disabled && field) field.focused = true
  }

  function commitFieldOnBlur() {
    field?.commitOnBlur(group ? group.value : checked)
  }

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(onclick, forwardClickToInput),
    onmousedown,
    onkeydown: chain(onkeydown, submitFormOnEnter),
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
  role="checkbox"
  aria-checked={indeterminate ? 'mixed' : checked}
  aria-labelledby={ariaLabelledBy.value}
  aria-readonly={readOnly || undefined}
  aria-required={required || undefined}
  aria-describedby={ariaDescribedBy}
  aria-invalid={ariaInvalid}
  onfocus={chain(onfocus, markFieldFocused)}
  onblur={chain(onblur, commitFieldOnBlur)}
  {...rest}
>
  {@render children?.(checkboxState)}
</svelte:element>

<input
  bind:this={inputElement}
  type="checkbox"
  id={inputId}
  {checked}
  {indeterminate}
  {disabled}
  {form}
  {name}
  {required}
  value={valueProp}
  tabindex={-1}
  aria-hidden="true"
  style={name ? visuallyHiddenInput : visuallyHidden}
  {@attach registerFieldInput}
  {onchange}
  onclick={(event) => event.stopPropagation()}
  onfocus={focusRoot}
/>
