<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { chain } from '$lib/internal/chain'
  import { labelInteraction, focusElementWithVisible } from '$lib/internal/label-interaction'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { registerLabelId } from '$lib/internal/register-label-id'
  import type { SliderState } from './slider.svelte'
  import { SliderContext } from './context'

  type Props = PartProps<[SliderState]>

  let {
    as = 'div',
    ref = $bindable(null),
    id,
    onclick,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const slider = SliderContext.get()
  const labelable = LabelableContext.get()

  const labelId = $derived(id ?? `${slider.id}-label`)

  const interaction = labelInteraction(() => ({
    focusControl: () => {
      if (slider.thumbElements.length !== 1) return
      const input = slider.getThumbInput(0)
      if (input) focusElementWithVisible(input)
    }
  }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...slider.stateAttrs}
  {@attach registerLabelId(slider, labelId)}
  {@attach registerLabelId(labelable, labelId)}
  id={labelId}
  onclick={chain(onclick, interaction.activateControl)}
  onpointerdown={chain(onpointerdown, (event) => event.preventDefault())}
  {...rest}
>
  {@render children?.(slider.state)}
</svelte:element>
