<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'

  let {
    as = 'span',
    onclick,
    onParentClick
  }: {
    as?: 'span' | 'button'
    onclick?: (event: MouseEvent) => void
    onParentClick: (event: MouseEvent) => void
  } = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div onclick={onParentClick}>
  <Checkbox.Root {as} {onclick} data-testid="checkbox" />
</div>
