<script lang="ts">
  import { FormContext } from '$lib/components/form/context'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import type { Attachment } from 'svelte/attachments'
  import type { HTMLAttributes, HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements'
  import type { WithPreventable } from '$lib/internal/types'
  import { FieldContext } from './context'
  import { getFieldAriaInvalid, getFieldStateAttrs } from './field.svelte'

  type Control = HTMLInputElement | HTMLTextAreaElement

  type Props = Omit<
    WithPreventable<HTMLAttributes<Control>, 'onfocus' | 'onblur' | 'oninput' | 'onkeydown'>,
    'children' | 'id'
  > &
    Omit<HTMLInputAttributes, keyof HTMLAttributes<Control>> &
    Omit<HTMLTextareaAttributes, keyof HTMLAttributes<Control>> & {
      as?: 'input' | 'textarea'
      ref?: Control | null
      id?: string
      onValueChange?: (value: string) => void
    }

  const uid = $props.id()

  let {
    as = 'input',
    ref = $bindable(null),
    id = uid,
    name: nameProp,
    value = $bindable(),
    disabled: disabledProp = false,
    autofocus = false,
    onValueChange,
    onfocus,
    onblur,
    oninput,
    onkeydown,
    'aria-describedby': ariaDescribedBy,
    ...rest
  }: Props = $props()

  const field = FieldContext.getOr()
  const formRoot = FormContext.getOr()
  const labelable = LabelableContext.get()

  const disabled = $derived(field?.disabled || !!disabledProp)
  const name = $derived(field?.name ?? nameProp ?? undefined)

  const describedBy = $derived(mergeDescribedBy(ariaDescribedBy, labelable.messageIds))

  const publishControlId: Attachment = () => labelable.registerControlId(id)

  const registerControl: Attachment<Control> = (node) => {
    if (disabled) return
    return field?.registerControl({
      id,
      element: () => node,
      value: () => node.value,
      name: () => nameProp ?? undefined
    })
  }

  const syncFilled: Attachment<Control> = (node) => {
    if (!field) return
    if (value != null) field.filled = value !== ''
    else if (node.value) field.filled = true
  }

  const syncFocused: Attachment<Control> = (node) => {
    if (autofocus && field && node.ownerDocument.activeElement === node) field.focused = true
  }

  function markFieldFocused() {
    if (field) field.focused = true
  }

  function commitFieldOnBlur() {
    if (!ref) return
    field?.commitOnBlur(ref.value)
  }

  function commitFieldValue(event: Event) {
    if (!ref) return
    const next = ref.value
    onValueChange?.(next)
    if (value !== undefined) value = next
    if (!field) return
    field.setDirty(next !== (field.validityData.initialValue ?? ''))
    field.filled = next !== ''

    if (event.defaultPrevented) return
    formRoot?.clearErrors(name)
    field.commitValue(next)
  }

  function commitFieldOnEnter(event: KeyboardEvent) {
    if (!field || !ref || as !== 'input' || event.key !== 'Enter') return
    field.setTouched(true)
    field.commit(ref.value)
  }

  const stateAttrs = $derived(dataAttrs({ disabled, ...getFieldStateAttrs(field) }))
</script>

<!-- svelte-ignore a11y_autofocus -->
<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach publishControlId}
  {@attach registerControl}
  {@attach syncFilled}
  {@attach syncFocused}
  {id}
  {name}
  {disabled}
  {autofocus}
  aria-labelledby={labelable.labelId}
  aria-describedby={describedBy}
  aria-invalid={getFieldAriaInvalid(field, disabled)}
  onfocus={chain(onfocus, markFieldFocused)}
  onblur={chain(onblur, commitFieldOnBlur)}
  oninput={chain(oninput, commitFieldValue)}
  onkeydown={chain(onkeydown, commitFieldOnEnter)}
  {value}
  {...rest}
/>
