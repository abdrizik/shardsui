<script lang="ts">
  import { Separator } from '@shardsui/svelte/separator'

  const stats = [
    { label: 'Projects', value: '6' },
    { label: 'Active days', value: '42' },
    { label: 'Hours', value: '118' }
  ]
</script>

<div class="flex items-center gap-4 text-nowrap">
  {#each stats as stat, index (stat.label)}
    {#if index > 0}
      <Separator orientation="vertical" class="w-px self-stretch bg-gray-300" />
    {/if}

    <dl class="flex flex-col">
      <dt class="text-xs text-gray-500">{stat.label}</dt>
      <dd class="text-lg font-medium text-gray-900">{stat.value}</dd>
    </dl>
  {/each}
</div>
