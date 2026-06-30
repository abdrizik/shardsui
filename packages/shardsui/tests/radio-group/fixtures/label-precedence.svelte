<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Fieldset } from '$lib/components/fieldset'
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let explicit = $state(true)
  let fieldLabel = $state('field-label-a')
  let showFieldLabel = $state(true)
  let legend = $state('legend-a')
  let showLegend = $state(true)
</script>

<span id="explicit-label">Explicit label</span>
<Field.Root name="choice">
  {#if showFieldLabel}
    {#key fieldLabel}
      <Field.Label as="span" id={fieldLabel}>Field label</Field.Label>
    {/key}
  {/if}
  <Fieldset.Root>
    {#if showLegend}
      {#key legend}
        <Fieldset.Legend id={legend}>Legend</Fieldset.Legend>
      {/key}
    {/if}
    <RadioGroup {...explicit ? { 'aria-labelledby': 'explicit-label' } : {}}>
      <Radio.Root value="a" />
    </RadioGroup>
  </Fieldset.Root>
</Field.Root>
<button type="button" onclick={() => (explicit = false)}>remove explicit</button>
<button
  type="button"
  onclick={() => {
    fieldLabel = 'field-label-b'
    showFieldLabel = true
  }}
>
  mount field replacement
</button>
<button type="button" onclick={() => (showFieldLabel = false)}>remove field label</button>
<button
  type="button"
  onclick={() => {
    legend = 'legend-b'
    showLegend = true
  }}
>
  mount legend replacement
</button>
<button type="button" onclick={() => (showLegend = false)}>remove legend</button>
