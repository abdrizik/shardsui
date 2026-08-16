<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { Button } from '$lib/internal/button.svelte'
  import { chain } from '$lib/internal/chain'
  import { ToastContext, type ToastActionState } from './context'

  type Props = PartProps<[ToastActionState], 'button', 'onkeydown' | 'onkeyup'> & {
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

  const toastRoot = ToastContext.get()

  const actionChildren = $derived(toastRoot.toast.actionProps?.children)
  const shouldRender = $derived(Boolean(actionChildren ?? children))

  const actionAttrs = $derived.by(() => {
    const actionProps = toastRoot.toast.actionProps
    if (!actionProps) return {}
    const {
      children: _children,
      onclick: _onclick,
      onmousedown: _onmousedown,
      onkeydown: _onkeydown,
      onkeyup: _onkeyup,
      onpointerdown: _onpointerdown,
      ...attrs
    } = actionProps
    return attrs
  })

  const btn = new Button(() => ({
    disabled,
    as,
    onclick: chain(toastRoot.toast.actionProps?.onclick, onclick),
    onmousedown: chain(toastRoot.toast.actionProps?.onmousedown, onmousedown),
    onkeydown: chain(toastRoot.toast.actionProps?.onkeydown, onkeydown),
    onkeyup: chain(toastRoot.toast.actionProps?.onkeyup, onkeyup),
    onpointerdown: chain(toastRoot.toast.actionProps?.onpointerdown, onpointerdown)
  }))

  const toastState: ToastActionState = $derived({ type: toastRoot.toast.type })
</script>

{#if shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...btn.attrs}
    {@attach btn.attach}
    data-type={toastRoot.toast.type}
    {...actionAttrs}
    {...rest}
  >
    {#if actionChildren}
      {actionChildren}
    {:else if children}
      {@render children(toastState)}
    {/if}
  </svelte:element>
{/if}
