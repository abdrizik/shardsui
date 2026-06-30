<script lang="ts">
  import { Button } from '$lib/internal/button.svelte'

  type Props = {
    as?: keyof HTMLElementTagNameMap
    disabled?: boolean
    focusableWhenDisabled?: boolean
    composite?: boolean
    tabindex?: number
    role?: string
    href?: string
    type?: 'button' | 'submit' | 'reset'
    onclick?: (e: MouseEvent) => void
    onkeydown?: (e: KeyboardEvent & { preventShardsUIHandler(): void }) => void
    onkeyup?: (e: KeyboardEvent & { preventShardsUIHandler(): void }) => void
    onfocus?: (e: FocusEvent) => void
    onblur?: (e: FocusEvent) => void
  }

  let {
    as = 'span',
    disabled = false,
    focusableWhenDisabled = false,
    composite = false,
    tabindex,
    role,
    href,
    type,
    onclick,
    onkeydown,
    onkeyup,
    onfocus,
    onblur
  }: Props = $props()

  const btn = new Button(() => ({
    as,
    disabled,
    focusableWhenDisabled,
    composite,
    tabindex,
    onclick,
    onkeydown,
    onkeyup
  }))
</script>

<svelte:element
  this={as}
  {...btn.attrs}
  data-testid="button"
  {...tabindex === undefined ? {} : { tabindex }}
  {...role ? { role } : {}}
  {...href ? { href } : {}}
  {...type ? { type } : {}}
  {onfocus}
  {onblur}
  {@attach btn.attach}
></svelte:element>
