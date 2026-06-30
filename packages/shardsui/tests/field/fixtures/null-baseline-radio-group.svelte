<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let value = $state<string | null>(null)
</script>

<Field.Root data-testid="root">
  <RadioGroup bind:value>
    <Radio.Root value="a" />
    <Radio.Root value="b" />
  </RadioGroup>
</Field.Root>
<button type="button" onclick={() => (value = 'a')}>a</button>
<button type="button" onclick={() => (value = 'b')}>b</button>
