<script lang="ts">
  import { Button } from '$lib/internal/button.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'

  type Props = PartProps<[{ disabled: boolean }], 'button'> & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled = false,
    onclick,
    onkeydown,
    onkeyup,
    onpointerdown,
    onmousedown,
    children,
    ...rest
  }: Props = $props()

  const btn = new Button(() => ({
    disabled,
    as,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(dataAttrs({ disabled }))
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {...rest}
>
  {@render children?.({ disabled })}
</svelte:element>
