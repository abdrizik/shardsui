<script lang="ts">
  import { Menu } from '$lib/components/menu'

  const handle = new Menu.Handle<string>()
</script>

<div>
  <Menu.Trigger {handle} id="trigger1" payload="first" data-testid="trigger1"
    >Trigger 1</Menu.Trigger
  >
  <Menu.Trigger {handle} id="trigger2" payload="second" data-testid="trigger2"
    >Trigger 2</Menu.Trigger
  >

  <Menu.Root {handle}>
    {#snippet children({ payload })}
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Viewport>
              {#if payload === 'first'}
                <div data-testid="payload-image-1">Preview 1</div>
              {/if}
              {#if payload === 'second'}
                <div data-testid="payload-image-2">Preview 2</div>
              {/if}
            </Menu.Viewport>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    {/snippet}
  </Menu.Root>
</div>
