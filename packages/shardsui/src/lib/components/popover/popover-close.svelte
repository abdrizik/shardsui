<script lang="ts">
  import { untrack } from 'svelte'
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { REASONS } from '$lib/internal/reasons'
  import { PopoverClosePartContext, PopoverContext } from './context'

  type Props = PartProps<[], 'button', 'onclick' | 'onkeydown' | 'onkeyup'> & {
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

  const popover = PopoverContext.get()
  const closePart = PopoverClosePartContext.getOr()

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(onclick, closeOnClick),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  $effect.pre(() => untrack(() => closePart?.register()))

  function closeOnClick(event: MouseEvent) {
    popover.setOpen(false, REASONS.closePress, event)
  }
</script>

<svelte:element this={as} bind:this={ref} {...btn.attrs} {@attach btn.attach} {...rest}>
  {@render children?.()}
</svelte:element>
