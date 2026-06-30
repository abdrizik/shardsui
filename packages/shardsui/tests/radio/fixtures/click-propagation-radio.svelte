<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

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

<RadioGroup>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div onclick={onParentClick}>
    <Radio.Root {as} {onclick} value="a" data-testid="radio" />
  </div>
</RadioGroup>
