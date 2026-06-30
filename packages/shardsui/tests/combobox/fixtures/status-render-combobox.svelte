<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Props = {
    open?: boolean
    statusText?: string
    as?: keyof HTMLElementTagNameMap
  }

  let { open = $bindable(), statusText = '', as = 'div' }: Props = $props()
</script>

<Combobox.Root {open}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.Status {as} data-testid="status">{statusText}</Combobox.Status>
        <Combobox.List data-testid="list">
          <Combobox.Item value="a">a</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
