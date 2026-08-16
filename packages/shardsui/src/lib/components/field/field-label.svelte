<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { focusElementWithVisible, labelInteraction } from '$lib/internal/label-interaction'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { registerLabelId } from '$lib/internal/register-label-id'
  import type { PartProps } from '$lib/internal/types'
  import { FieldItemContext, FieldContext, type FieldRootState } from './context'
  import { getFieldState, getFieldStateAttrs } from './field.svelte'

  type Props = PartProps<[FieldRootState], 'label', 'onclick' | 'onmousedown' | 'onpointerdown'>

  const uid = $props.id()

  let {
    as = 'label',
    ref = $bindable(null),
    id = uid,
    onmousedown,
    onclick,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const field = FieldContext.get()
  const item = FieldItemContext.getOr()
  const labelable = LabelableContext.get()

  const native = $derived(as === 'label')
  const disabled = $derived(field.disabled || (item?.disabled ?? false))

  const interaction = labelInteraction(() => ({
    native,
    focusControl: () => {
      const controlId = labelable.controlId
      if (!ref || !controlId) return
      const control = ref.ownerDocument.getElementById(controlId)
      if (control) focusElementWithVisible(control)
    }
  }))

  const fieldState = $derived({ ...getFieldState(field), disabled })

  const stateAttrs = $derived(dataAttrs({ disabled, ...getFieldStateAttrs(field) }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach registerLabelId(labelable, id)}
  {id}
  for={native ? labelable.controlId : undefined}
  onmousedown={chain(onmousedown, native ? interaction.activateControl : undefined)}
  onclick={chain(onclick, native ? undefined : interaction.activateControl)}
  onpointerdown={chain(onpointerdown, native ? undefined : (event) => event.preventDefault())}
  {...rest}
>
  {@render children?.(fieldState)}
</svelte:element>
