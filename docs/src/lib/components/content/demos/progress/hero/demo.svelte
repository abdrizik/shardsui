<script lang="ts">
  import { Progress } from '@shardsui/svelte/progress'

  let value = $state(15)

  $effect(() => {
    const interval = setInterval(() => {
      value = Math.min(100, Math.round(value + Math.random() * 20))
    }, 1000)
    return () => clearInterval(interval)
  })
</script>

<Progress.Root class="grid w-60 max-w-full grid-cols-2 gap-y-2" {value}>
  <Progress.Label class="text-sm font-normal text-gray-900">Uploading</Progress.Label>
  <Progress.Value class="text-right text-sm text-gray-900 tabular-nums" />
  <Progress.Track
    class="col-span-full h-1 overflow-hidden rounded-sm bg-gray-50 inset-ring inset-ring-gray-200"
  >
    <Progress.Indicator class="block bg-gray-500 transition-[width] duration-500" />
  </Progress.Track>
</Progress.Root>
