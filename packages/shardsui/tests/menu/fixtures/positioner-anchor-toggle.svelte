<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let anchorElement = $state<HTMLDivElement | null>(null)
  let useAnchor = $state(true)
</script>

<div style="margin: 50px;">
  <button type="button" onclick={() => (useAnchor = false)}>undefined</button>
  <button type="button" onclick={() => (useAnchor = true)}>ref</button>
  <Menu.Root bind:open={() => true, () => {}}>
    <Menu.Trigger>trigger</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner
        side="bottom"
        align="start"
        anchor={useAnchor ? anchorElement : undefined}
        arrowPadding={0}
        data-testid="positioner"
      >
        <Menu.Popup>
          <Menu.Item>1</Menu.Item>
          <Menu.Item>2</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
  <div
    bind:this={anchorElement}
    data-testid="anchor"
    style="margin-top: 100px; width: 10px; height: 10px;"
  ></div>
</div>
