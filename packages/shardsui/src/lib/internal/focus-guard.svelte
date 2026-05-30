<script lang="ts">
  import { visuallyHidden } from '$lib/internal/visually-hidden'
  import { isIOS, isMac, isWebKit } from '$lib/internal/detect-browser'

  type Props = {
    ref?: HTMLSpanElement | null
    onfocus?: (event: FocusEvent) => void
  }

  let { ref = $bindable(null), onfocus }: Props = $props()

  // Unlike NVDA and JAWS, VoiceOver's virtual cursor triggers `onfocus` as
  // it moves — but only on focusable/role-button elements through WebKit's
  // NSAccessibility path. Setting `role="button"` lets the focus trap catch
  // the cursor.
  const role = (isMac || isIOS) && isWebKit ? 'button' : undefined
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  bind:this={ref}
  tabindex="0"
  {role}
  aria-hidden={role ? undefined : true}
  data-shards-ui-focus-guard=""
  style={visuallyHidden}
  {onfocus}
></span>
