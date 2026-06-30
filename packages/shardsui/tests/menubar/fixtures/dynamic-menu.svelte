<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import type { Snippet } from 'svelte'
  import MenuContentItems from './menu-content-items.svelte'
  import type { MenuDefinition } from './menu-contents'

  let { handle, triggers }: { handle?: Menu.Handle<MenuDefinition>; triggers?: Snippet } = $props()
</script>

<Menu.Root {handle}>
  {#snippet children({ payload })}
    {@render triggers?.()}
    <Menu.Portal>
      <Menu.Positioner data-testid={(payload as MenuDefinition | undefined)?.menuTestId}>
        <Menu.Popup>
          <MenuContentItems items={(payload as MenuDefinition | undefined)?.items ?? []} />
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  {/snippet}
</Menu.Root>
