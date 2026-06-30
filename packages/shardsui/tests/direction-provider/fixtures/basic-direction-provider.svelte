<script lang="ts">
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'
  import DirectionProbe from './direction-probe.svelte'

  let { direction }: { direction?: TextDirection } = $props()
</script>

<DirectionProvider {direction}>
  <DirectionProbe />
</DirectionProvider>
