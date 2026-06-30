<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import { Menubar } from '$lib/components/menubar'

  let {
    orientation = 'horizontal',
    onSide
  }: { orientation?: 'horizontal' | 'vertical'; onSide: (side: string) => void } = $props()
</script>

<Menubar {orientation}>
  <Menu.Root open>
    <Menu.Trigger style="margin: 100px">File</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner
        sideOffset={(data) => {
          onSide(data.side)
          return 0
        }}
      >
        <Menu.Popup style="width: 50px; height: 50px">Open</Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>
