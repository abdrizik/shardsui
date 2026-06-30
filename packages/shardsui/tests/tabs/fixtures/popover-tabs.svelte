<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import { Tabs } from '$lib/components/tabs'
  let value = $state('overview')
</script>

<Popover.Root>
  <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner sideOffset={8}>
      <Popover.Popup>
        <Tabs.Root bind:value>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="projects">Projects</Tabs.Tab>
            <Tabs.Tab value="account">Account</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overview" />
          <Tabs.Panel value="projects" />
          <Tabs.Panel value="account" />
        </Tabs.Root>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
