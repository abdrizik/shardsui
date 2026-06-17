<script lang="ts">
  import { visuallyHiddenInput } from '$lib/internal/visually-hidden'
  import { Button } from '$lib/internal/button.svelte'
  import { REASONS } from '$lib/internal/reasons'
  import { ComboboxContext } from './context'

  type Props = { ref?: HTMLElement | null }

  let { ref = $bindable(null) }: Props = $props()

  const combobox = ComboboxContext.get()

  function onclick() {
    combobox.setOpen(false, REASONS.closePress)
  }

  const btn = new Button(() => ({ as: 'span', tabindex: null, onclick }))
</script>

<span
  bind:this={ref}
  {...btn.attrs}
  aria-label="Dismiss"
  style={visuallyHiddenInput}
  {@attach btn.attach}
></span>
