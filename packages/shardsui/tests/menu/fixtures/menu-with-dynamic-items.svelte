<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let itemsFiltered = $state(false)

  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      setTimeout(() => {
        itemsFiltered = true
      }, 0)
    }
  }

  function handleOpenChangeComplete(newOpen: boolean) {
    if (!newOpen) {
      itemsFiltered = false
    }
  }
</script>

<Menu.Root onOpenChange={handleOpenChange} onOpenChangeComplete={handleOpenChangeComplete}>
  <Menu.Trigger>Toggle</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item>Add to Library</Menu.Item>
        {#if !itemsFiltered}
          <Menu.Item>Add to Playlist</Menu.Item>
          <Menu.Item>Play Next</Menu.Item>
          <Menu.Item>Play Last</Menu.Item>
        {/if}
        <Menu.Item>Favorite</Menu.Item>
        <Menu.Item>Share</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
