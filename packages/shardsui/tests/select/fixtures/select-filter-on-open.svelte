<script lang="ts">
  import { Select } from '$lib/components/select'

  let itemsFiltered = $state(false)
</script>

<Select.Root
  onOpenChange={(open) => {
    if (open) {
      setTimeout(() => {
        itemsFiltered = true
      }, 0)
    }
  }}
  onOpenChangeComplete={(open) => {
    if (!open) {
      itemsFiltered = false
    }
  }}
>
  <Select.Trigger>Toggle</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="library">Add to Library</Select.Item>
        {#if !itemsFiltered}
          <Select.Item value="playlist">Add to Playlist</Select.Item>
          <Select.Item value="next">Play Next</Select.Item>
          <Select.Item value="last">Play Last</Select.Item>
        {/if}
        <Select.Item value="favorite">Favorite</Select.Item>
        <Select.Item value="share">Share</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
