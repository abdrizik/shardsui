<script lang="ts">
  import { Tabs } from '@shardsui/svelte/tabs'

  const tabs = [
    { value: 'overview', label: 'Overview', body: 'Workspace stats and activity.' },
    { value: 'projects', label: 'Projects', body: 'Milestones and deadlines.' },
    { value: 'account', label: 'Account', body: 'Profile and preferences.' }
  ]
</script>

<Tabs.Root class="w-fit rounded-md border border-gray-200" value="overview">
  <Tabs.List class="relative z-0 flex gap-1 border-b border-gray-200 px-1">
    {#each tabs as tab (tab.value)}
      <Tabs.Tab
        class="flex h-8 items-center justify-center border-0 px-3 text-sm font-normal whitespace-nowrap text-gray-600 outline-hidden select-none before:inset-x-0 before:inset-y-1 before:rounded-xs before:-outline-offset-1 before:outline-gray-950 hover:text-gray-900 focus-visible:relative focus-visible:before:absolute focus-visible:before:outline-2 data-active:text-gray-900"
        value={tab.value}>{tab.label}</Tabs.Tab
      >
    {/each}
    <Tabs.Indicator
      class="absolute top-1/2 left-0 z-[-1] h-6 w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-xs bg-gray-100 transition-[translate,width] duration-150 ease-in-out"
    />
  </Tabs.List>
  <div class="grid grid-cols-1 overflow-hidden">
    {#each tabs as tab (tab.value)}
      <Tabs.Panel
        class="col-start-1 row-start-1 w-0 min-w-full p-4 text-sm/5.75 text-gray-700 outline-hidden [transition:opacity_175ms_ease,translate_350ms_cubic-bezier(0.22,1,0.36,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:data-[activation-direction=left]:translate-x-1/2 motion-safe:data-starting-style:data-[activation-direction=left]:-translate-x-1/2 motion-safe:data-ending-style:data-[activation-direction=right]:-translate-x-1/2 motion-safe:data-starting-style:data-[activation-direction=right]:translate-x-1/2"
        value={tab.value}
      >
        {tab.body}
      </Tabs.Panel>
    {/each}
  </div>
</Tabs.Root>
