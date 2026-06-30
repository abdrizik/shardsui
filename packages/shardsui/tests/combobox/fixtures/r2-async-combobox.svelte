<script lang="ts">
  import { untrack } from 'svelte'
  import { Combobox } from '$lib/components/combobox'

  type Country = { code: string; label: string }

  let {
    countries = undefined as Country[] | undefined,
    inputInsidePopup = false,
    isItemEqualToValue = ((item: Country, v: Country) => item?.code === v?.code) as (
      item: Country,
      v: Country
    ) => boolean,
    initialValue = undefined as Country | undefined
  } = $props()

  let value = $state<Country | null>(untrack(() => initialValue) ?? null)
  let inputValue = $state('')
</script>

<Combobox.Root
  items={countries as never}
  filter={null}
  bind:value
  bind:inputValue
  isItemEqualToValue={isItemEqualToValue as never}
  itemToStringLabel={((item: Country) => item.label) as never}
>
  {#if !inputInsidePopup}
    <Combobox.Input data-testid="input" />
  {:else}
    <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  {/if}
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        {#if inputInsidePopup}
          <Combobox.Input data-testid="input" />
          <Combobox.Empty data-testid="empty">No countries found.</Combobox.Empty>
        {/if}
        <Combobox.List data-testid="list">
          {#each countries ?? [] as country (country.code)}
            <Combobox.Item value={country}>{country.label}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
