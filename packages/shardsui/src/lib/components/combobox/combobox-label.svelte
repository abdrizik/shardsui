<script lang="ts">
  import { FieldContext } from '$lib/components/field/context'
  import { getFieldState, getFieldStateAttrs } from '$lib/components/field/field.svelte'
  import type { FieldRootState } from '$lib/components/field/context'
  import { focusElementWithVisible, labelInteraction } from '$lib/internal/label-interaction'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { chain } from '$lib/internal/chain'
  import { registerLabelId } from '$lib/internal/register-label-id'
  import { ComboboxContext } from './context'

  type Props = PartProps<[FieldRootState], 'div', 'onclick' | 'onpointerdown'>

  let {
    as = 'div',
    ref = $bindable(null),
    id,
    onclick,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const combobox = ComboboxContext.get()
  const field = FieldContext.getOr()

  const labelId = $derived(id ?? `${combobox.rootId}-label`)

  const comboboxState: FieldRootState = $derived({
    ...getFieldState(field),
    disabled: field?.disabled ?? false
  })

  const stateAttrs = $derived(dataAttrs(getFieldStateAttrs(field)))

  const interaction = labelInteraction(() => ({
    focusControl: () => {
      const control = combobox.inputElement ?? combobox.triggerElement
      if (control) focusElementWithVisible(control)
    }
  }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  {@attach registerLabelId(combobox, labelId)}
  id={labelId}
  onclick={chain(onclick, interaction.activateControl)}
  onpointerdown={chain(onpointerdown, (event) => event.preventDefault())}
  {...rest}
>
  {@render children?.(comboboxState)}
</svelte:element>
