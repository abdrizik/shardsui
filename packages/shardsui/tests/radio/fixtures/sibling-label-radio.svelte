<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { id = 'radio-input' }: { id?: string } = $props()
</script>

<div>
  <label for="radio-input">Label A</label>
  <label for="radio-input-b">Label B</label>
  <RadioGroup>
    <Radio.Root value="a" {id} />
  </RadioGroup>
</div>
