<script lang="ts">
  import { Select } from '$lib/components/select'

  type User = { id: number; name: string; source?: string }

  let {
    value = $bindable<User | User[] | null>(null),
    onValueChange,
    multiple = false,
    open = $bindable(false),
    users = [
      { id: 1, name: 'Alice', source: 'item' },
      { id: 2, name: 'Bob', source: 'item' }
    ],
    isItemEqualToValue = (item: User, val: User) => item.id === val.id
  }: {
    value?: User | User[] | null
    onValueChange?: (v: unknown) => void
    multiple?: boolean
    open?: boolean
    users?: User[]
    isItemEqualToValue?: (item: User, value: User) => boolean
  } = $props()
</script>

<Select.Root
  {value}
  {onValueChange}
  {multiple}
  {open}
  {isItemEqualToValue}
  itemToStringLabel={(item: User) => item.name}
  itemToStringValue={(item: User) => String(item.id)}
>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#each users as user (user.id)}
          <Select.Item value={user}>{user.name}</Select.Item>
        {/each}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
