<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  let {
    onclick = () => {},
    onmousedown = () => {},
    onpointerdown = () => {},
    onkeydown = () => {},
    onmousemove = () => {}
  }: {
    onclick?: (e: MouseEvent) => void
    onmousedown?: (e: MouseEvent) => void
    onpointerdown?: (e: PointerEvent) => void
    onkeydown?: (e: KeyboardEvent) => void
    onmousemove?: (e: MouseEvent) => void
  } = $props()
</script>

<Toolbar.Root>
  <Toolbar.Button
    data-testid="btn"
    disabled
    {onclick}
    {onmousedown}
    {onpointerdown}
    {onkeydown}
    {onmousemove}>Button</Toolbar.Button
  >
</Toolbar.Root>
