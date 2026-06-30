<script lang="ts">
  import { Fieldset } from '$lib/components/fieldset'

  let legendId = $state('legend-a')
  let showLegend = $state(true)
</script>

<Fieldset.Root>
  {#if showLegend}
    <Fieldset.Legend id={legendId}>Legend</Fieldset.Legend>
  {/if}
</Fieldset.Root>
<button type="button" onclick={() => (legendId = 'legend-b')}>Change id</button>
<button type="button" onclick={() => (showLegend = false)}>Remove legend</button>
