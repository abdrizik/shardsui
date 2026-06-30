<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type User = { id: number; name: string }

  let {
    isItemEqualToValue = undefined as ((item: unknown, value: unknown) => boolean) | undefined
  } = $props()

  const users: User[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]

  let value = $state<User | null>(users[0])
  let open = $state(true)
</script>

<Combobox.Root
  bind:value
  bind:open
  items={users}
  name="user"
  itemToStringLabel={(item) => (item as User).name}
  itemToStringValue={(item) => String((item as User).id)}
  {isItemEqualToValue}
>
  <Combobox.Trigger>
    <Combobox.Value />
  </Combobox.Trigger>
  <Combobox.Clear data-testid="clear" />
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
