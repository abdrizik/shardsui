<script lang="ts">
  import { untrack } from 'svelte'
  import { Select } from '$lib/components/select'
  import { Popover } from '$lib/components/popover'

  let {
    selectModal = true,
    programmatic = false,
    popoverModal = false,
    popoverOpen = true
  }: {
    selectModal?: boolean
    programmatic?: boolean
    popoverModal?: boolean
    popoverOpen?: boolean
  } = $props()

  let open = $state(untrack(() => popoverOpen))
  let selectOpen = $state(false)
</script>

<Popover.Root bind:open modal={popoverModal}>
  <Popover.Trigger>Open popover</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">
        {#if programmatic}
          <button type="button" onclick={() => (selectOpen = true)}>
            Open select programmatically
          </button>
        {/if}
        <Select.Root modal={selectModal} bind:open={selectOpen}>
          <Select.Label>Apple</Select.Label>
          <Select.Trigger data-testid="select-trigger">
            <Select.Value placeholder="Pick one" />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={8}>
              <Select.Popup>
                <Select.Item value="one">One</Select.Item>
                <Select.Item value="two">Two</Select.Item>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
