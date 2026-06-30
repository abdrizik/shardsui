<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import { Tabs } from '$lib/components/tabs'
  let value = $state('overview')
</script>

<Dialog.Root>
  <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup>
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
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
