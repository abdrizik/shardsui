<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type User = { id: number; name: string; source?: string }

  let {
    value = $bindable<unknown>(undefined),
    multiple = false,
    open = $bindable(true),
    isItemEqualToValue = (item: User, v: User) => item.id === v.id,
    users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ] as User[]
  }: {
    value?: unknown
    multiple?: boolean
    open?: boolean
    isItemEqualToValue?: (item: User, v: User) => boolean
    users?: User[]
  } = $props()
</script>

<Combobox.Root
  items={users as never}
  value={value as never}
  {multiple}
  bind:open
  itemToStringLabel={(item: User) => item.name}
  itemToStringValue={(item: User) => String(item.id)}
  isItemEqualToValue={isItemEqualToValue as never}
>
  <Combobox.Input data-testid="input" />
  <span data-testid="value">
    <Combobox.Value />
  </span>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          {#each users as user (user.id)}
            <Combobox.Item value={user}>{user.name}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
