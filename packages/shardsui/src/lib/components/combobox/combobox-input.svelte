<script lang="ts">
  import { FieldContext } from '$lib/components/field/context'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { getFieldStateAttrs } from '$lib/components/field/field.svelte'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import ComboboxInternalDismissButton from './combobox-internal-dismiss-button.svelte'
  import { ComboboxInput } from './input.svelte'
  import { ComboboxPositionerContext, ComboboxContext } from './context'

  type Props = Omit<
    PartProps<
      [],
      'input',
      | 'onblur'
      | 'onclick'
      | 'oncompositionend'
      | 'oncompositionstart'
      | 'onfocus'
      | 'oninput'
      | 'onkeydown'
      | 'onpointerdown'
    >,
    'children' | 'placeholder' | 'disabled' | 'autocomplete'
  > & {
    as?: 'input' | 'textarea'
    placeholder?: string
    disabled?: boolean
    autocomplete?: HTMLInputElement['autocomplete']
  }

  let {
    as = 'input',
    ref = $bindable(null),
    id: idProp,
    placeholder,
    disabled = false,
    autocomplete = 'off',
    onfocus,
    onblur,
    onkeydown,
    oninput,
    onclick,
    onpointerdown,
    oncompositionstart,
    oncompositionend,
    'aria-describedby': ariaDescribedByProp,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  const field = FieldContext.getOr()
  const labelable = LabelableContext.get()
  const positioner = ComboboxPositionerContext.getOr()
  const uid = $props.id()
  const hasPositionerParent = positioner != null

  const input = new ComboboxInput(combobox, () => ({ ref, id: idProp, uid, disabled }))

  const ariaDescribedBy = $derived(
    hasPositionerParent
      ? ariaDescribedByProp
      : mergeDescribedBy(ariaDescribedByProp, labelable.messageIds)
  )

  const isExpanded = $derived(combobox.open || combobox.inline)
  const shouldApplyAria = $derived(as === 'input' || isExpanded)

  const stateAttrs = $derived(
    dataAttrs({
      'popup-open': combobox.open,
      pressed: combobox.open,
      disabled: input.disabled,
      readonly: combobox.readOnly,
      'popup-side': combobox.popupSide ?? undefined,
      'list-empty': combobox.isEmpty,
      ...(hasPositionerParent ? {} : getFieldStateAttrs(field))
    })
  )
</script>

{#if combobox.open && combobox.focusManagerModal}
  <ComboboxInternalDismissButton bind:ref={combobox.startDismissElement} />
{/if}
<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach input.registerInputElement}
  {@attach input.publishControlId}
  {@attach input.syncValue}
  id={input.id}
  disabled={input.disabled}
  readonly={combobox.readOnly}
  required={combobox.noSelection ? combobox.required : undefined}
  name={combobox.name && combobox.inputOwnsFormValue ? combobox.name : undefined}
  form={combobox.form || undefined}
  {placeholder}
  {autocomplete}
  spellcheck={as === 'input' ? false : undefined}
  autocorrect={as === 'input' ? 'off' : undefined}
  autocapitalize={as === 'input' ? 'none' : undefined}
  role={shouldApplyAria ? 'combobox' : undefined}
  aria-haspopup={shouldApplyAria ? (combobox.grid ? 'grid' : 'listbox') : undefined}
  aria-expanded={shouldApplyAria ? isExpanded : undefined}
  aria-controls={isExpanded ? combobox.listId : undefined}
  aria-activedescendant={input.highlightedItemId}
  aria-autocomplete={shouldApplyAria ? combobox.autoComplete : undefined}
  aria-labelledby={labelable.labelId}
  aria-describedby={ariaDescribedBy}
  aria-invalid={!hasPositionerParent && field?.valid === false && !input.disabled
    ? true
    : undefined}
  aria-required={combobox.required || undefined}
  aria-readonly={combobox.readOnly || undefined}
  onfocus={chain(onfocus, input.onfocus)}
  onblur={chain(onblur, input.onblur)}
  oninput={chain(oninput, input.oninput)}
  onkeydown={chain(onkeydown, input.onkeydown)}
  onclick={chain(onclick, input.onclick)}
  onpointerdown={chain(onpointerdown, combobox.openInteractionHandlers.onpointerdown)}
  oncompositionstart={chain(oncompositionstart, input.oncompositionstart)}
  oncompositionend={chain(oncompositionend, input.oncompositionend)}
  {...rest}
/>
