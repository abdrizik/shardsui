<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { onValueChange }: { onValueChange: (value: unknown) => void } = $props()
</script>

<RadioGroup {onValueChange}>
  <Radio.Root value="a" data-testid="item" />
</RadioGroup>
