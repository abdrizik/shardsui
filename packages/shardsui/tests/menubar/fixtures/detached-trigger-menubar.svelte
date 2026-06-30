<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Menubar } from '$lib/components/menubar'
  import DynamicMenu from './dynamic-menu.svelte'
  import { menuContents, type MenuDefinition } from './menu-contents'

  let {
    disabled = false,
    loopFocus = true,
    orientation = 'horizontal',
    outside = false
  }: {
    disabled?: boolean
    loopFocus?: boolean
    orientation?: 'horizontal' | 'vertical'
    outside?: boolean
  } = $props()

  const handle = new Menu.Handle<MenuDefinition>()
</script>

<div>
  <Menubar data-testid="menubar-root" style="display: flex" {disabled} {loopFocus} {orientation}>
    {#each Object.entries(menuContents) as [key, menuDef] (key)}
      <Menu.Trigger {handle} payload={menuDef} data-testid={menuDef.triggerTestId}>
        {menuDef.label}
      </Menu.Trigger>
    {/each}
  </Menubar>
  <DynamicMenu {handle} />
  {#if outside}
    <button data-testid="outside">Outside</button>
  {/if}
</div>
