<script lang="ts">
  import { FieldContext, type FieldRootState } from '$lib/components/field/context'
  import { getFieldState, getFieldStateAttrs } from '$lib/components/field/field.svelte'
  import { chain } from '$lib/internal/chain'
  import { labelInteraction, focusElementWithVisible } from '$lib/internal/label-interaction'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { registerLabelId } from '$lib/internal/register-label-id'
  import { SelectContext } from './context'

  type Props = PartProps<[FieldRootState]>

  let {
    as = 'div',
    ref = $bindable(null),
    id,
    onclick,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const select = SelectContext.get()
  const field = FieldContext.getOr()

  const labelId = $derived(id ?? `${select.rootId}-label`)

  const selectState = $derived({
    ...getFieldState(field),
    disabled: field?.disabled ?? false
  })

  const stateAttrs = $derived(dataAttrs(getFieldStateAttrs(field)))

  const interaction = labelInteraction(() => ({
    focusControl: () => {
      if (select.triggerElement) focusElementWithVisible(select.triggerElement)
    }
  }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach registerLabelId(select, labelId)}
  id={labelId}
  onclick={chain(onclick, interaction.activateControl)}
  onpointerdown={chain(onpointerdown, (event) => event.preventDefault())}
  {...rest}
>
  {@render children?.(selectState)}
</svelte:element>
