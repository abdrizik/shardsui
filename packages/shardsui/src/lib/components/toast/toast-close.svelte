<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { ToastProviderContext, ToastContext, type ToastCloseState } from './context'

  type Props = PartProps<
    [ToastCloseState],
    'button',
    'onblur' | 'onclick' | 'onfocus' | 'onkeydown' | 'onkeyup'
  > & {
    disabled?: boolean
  }

  let {
    as = 'button',
    ref = $bindable(null),
    disabled = false,
    onfocus,
    onblur,
    onclick,
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const toastRoot = ToastContext.get()
  const provider = ToastProviderContext.get()

  let hasFocus = $state(false)

  const ariaHidden = $derived(!provider.expanded && !hasFocus)

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(onclick, () => provider.close(toastRoot.toast.id)),
    onmousedown,
    onkeydown,
    onkeyup,
    onpointerdown
  }))

  const toastState: ToastCloseState = $derived({ type: toastRoot.toast.type })
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...btn.attrs}
  {@attach btn.attach}
  data-type={toastRoot.toast.type}
  aria-hidden={ariaHidden}
  onfocus={chain(onfocus, () => (hasFocus = true))}
  onblur={chain(onblur, () => (hasFocus = false))}
  {...rest}
>
  {@render children?.(toastState)}
</svelte:element>
