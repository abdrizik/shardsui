<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { REASONS } from '$lib/internal/reasons'
  import { DialogContext, type DialogCloseState } from './context'

  type Props = PartProps<[DialogCloseState], 'button', 'onclick' | 'onkeydown' | 'onkeyup'> & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled = false,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const dialog = DialogContext.get()

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(onclick, closeOnClick),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const dialogState: DialogCloseState = $derived({ disabled })

  const stateAttrs = $derived(dataAttrs({ disabled }))

  function closeOnClick(event: MouseEvent) {
    if (dialog.open) dialog.setOpen(false, REASONS.closePress, event)
  }
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {...stateAttrs}
  {@attach btn.attach}
  {...rest}
>
  {@render children?.(dialogState)}
</svelte:element>
