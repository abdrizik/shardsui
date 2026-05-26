<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { CollapsibleState } from './collapsible.svelte'
  import { CollapsibleContext } from './context'

  type Props = PartProps<[CollapsibleState], 'button'> & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled: disabledProp,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const collapsible = CollapsibleContext.get()

  const disabled = $derived(disabledProp ?? collapsible.disabled)

  const btn = new Button(() => ({
    disabled,
    as,
    focusableWhenDisabled: true,
    onclick: chain(onclick, collapsible.toggle),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(
    dataAttrs({
      'panel-open': collapsible.open,
      disabled: collapsible.disabled,
      'starting-style': collapsible.transitionStatus === 'starting',
      'ending-style': collapsible.transitionStatus === 'ending'
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  aria-expanded={collapsible.open}
  aria-controls={collapsible.open ? collapsible.panelId : undefined}
  {...rest}
>
  {@render children?.(collapsible.state)}
</svelte:element>
