<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let phase = $state(0)
</script>

<Popover.Root open>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup>
        {#if phase < 2}
          {#key phase}
            <Popover.Title>Title {phase + 1}</Popover.Title>
            <Popover.Description>Description {phase + 1}</Popover.Description>
          {/key}
        {/if}
        <button onclick={() => (phase += 1)}>Change labels</button>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
