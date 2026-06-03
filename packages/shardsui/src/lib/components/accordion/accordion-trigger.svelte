<script lang="ts">
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import type { AccordionItemState } from './accordion.svelte'
  import { AccordionItemContext } from './context'

  type Props = PartProps<[AccordionItemState], 'button'> & {
    disabled?: boolean
  }

  const uid = $props.id()

  let {
    as = 'button',
    ref = $bindable(null),
    id = uid,
    disabled: disabledProp,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const item = AccordionItemContext.get()

  function registerTriggerId() {
    item.triggerId = id
    return () => {
      item.triggerId = undefined
    }
  }

  const disabled = $derived(disabledProp || item.disabled)

  const btn = new Button(() => ({
    disabled,
    as,
    focusableWhenDisabled: true,
    onclick: chain(onclick, item.collapsible.toggle),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const stateAttrs = $derived(
    dataAttrs({
      'panel-open': item.open,
      disabled: item.disabled,
      hidden: item.hidden
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {@attach registerTriggerId}
  {id}
  aria-expanded={item.open}
  aria-controls={item.open ? item.collapsible.panelId : undefined}
  {...rest}
>
  {@render children?.(item.state)}
</svelte:element>
