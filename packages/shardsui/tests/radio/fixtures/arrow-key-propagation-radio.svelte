<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onParentClick }: { onParentClick: (event: MouseEvent) => void } = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div onclick={onParentClick}>
  <RadioGroup value="a">
    <Radio.Root value="a" data-testid="radio-a" />
    <Radio.Root value="b" data-testid="radio-b" />
  </RadioGroup>
</div>
