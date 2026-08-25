<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { createFilter } from '$lib/internal/create-filter'
  import ItemsList from './items-list.svelte'

  type Movie = { id: number; english: string; romaji: string }

  const movies: Movie[] = [
    { id: 1, english: 'Spirited Away', romaji: 'Sen to Chihiro no Kamikakushi' },
    { id: 2, english: 'My Neighbor Totoro', romaji: 'Tonari no Totoro' },
    { id: 3, english: 'Princess Mononoke', romaji: 'Mononoke Hime' }
  ]

  function stringifyMovie(movie: Movie | null): string {
    return movie ? `${movie.english} ${movie.romaji}` : ''
  }

  let value = $state<Movie | null>(null)

  const filter = createFilter()
</script>

<Combobox.Root
  items={movies}
  bind:value
  filter={(item: Movie | null, query: string) =>
    item ? filter.contains(item, query, stringifyMovie) : false}
  itemToStringLabel={(movie: Movie | null) => movie?.english ?? ''}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <ItemsList label={(item) => (item as Movie).english} />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
