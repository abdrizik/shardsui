<script lang="ts">
  import { chain } from '$lib/internal/chain'
  import type { PartProps } from '$lib/internal/types'
  import { SliderContext } from './context'
  import { createSliderControl } from './control.svelte'
  import type { SliderState } from './slider.svelte'

  type Props = PartProps<[SliderState]>

  let { as = 'div', ref = $bindable(null), onpointerdown, children, ...rest }: Props = $props()

  const slider = SliderContext.get()

  const control = createSliderControl(slider)
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...slider.stateAttrs}
  {@attach control.publishControlElement}
  {@attach control.listenTouchStart}
  onpointerdown={chain(onpointerdown, control.onpointerdown)}
  {...rest}
>
  {@render children?.(slider.state)}
</svelte:element>
