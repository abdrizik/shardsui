<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'
</script>

<div>
  <label data-testid="label" for="myRadio">A</label>
  <RadioGroup value="b">
    <Radio.Root value="a" id="myRadio" as="button" data-testid="a" />
    <Radio.Root value="b" data-testid="b" />
  </RadioGroup>
</div>
