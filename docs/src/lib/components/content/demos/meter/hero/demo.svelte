<script lang="ts">
  import { Meter } from '@shardsui/svelte/meter'
</script>

<Meter.Root class="grid w-60 max-w-full grid-cols-2 gap-y-2" value={50}>
  <Meter.Label class="text-sm font-normal text-gray-900">Daily goal</Meter.Label>
  <Meter.Value class="text-right text-sm text-gray-900" />
  <Meter.Track
    class="col-span-2 h-1 overflow-hidden rounded-sm bg-gray-50 inset-ring inset-ring-gray-200"
  >
    <Meter.Indicator class="bg-gray-500 transition-[width] duration-500" />
  </Meter.Track>
</Meter.Root>
