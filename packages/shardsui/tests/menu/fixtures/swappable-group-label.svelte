<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let { labels = 'old' }: { labels?: 'old' | 'both' | 'new' } = $props()
</script>

<Menu.Root open>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Group>
          {#if labels !== 'new'}
            <Menu.GroupLabel id="old-label">Old</Menu.GroupLabel>
          {/if}
          {#if labels !== 'old'}
            <Menu.GroupLabel id="new-label">New</Menu.GroupLabel>
          {/if}
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
