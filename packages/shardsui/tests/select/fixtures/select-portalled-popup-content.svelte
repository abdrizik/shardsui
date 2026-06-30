<script lang="ts">
  import { Select } from '$lib/components/select'
  import { portalTo } from '$lib/internal/floating/portal'
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">Open</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.List>
          <Select.Item value="apple">Apple</Select.Item>
        </Select.List>
        <div data-shards-ui-portal {@attach portalTo(null)}>Portalled content</div>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
