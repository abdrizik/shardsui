<script lang="ts" generics="Value = unknown, Multiple extends boolean | undefined = false">
  import type { ComponentProps } from 'svelte'
  import ComboboxShell from './combobox-shell.svelte'

  type Props = Omit<
    ComponentProps<typeof ComboboxShell<Value, Multiple>>,
    'selectionMode' | 'formAutoComplete' | 'autoComplete' | 'autoHighlight'
  > & {
    autoComplete?: string | undefined
    autoHighlight?: boolean | undefined
    multiple?: Multiple
  }

  let {
    value = $bindable(),
    inputValue = $bindable(),
    open = $bindable(false),
    autoComplete,
    multiple = false as Multiple,
    children,
    ...rest
  }: Props = $props()
</script>

<ComboboxShell
  bind:value
  bind:inputValue
  bind:open
  formAutoComplete={autoComplete}
  selectionMode={multiple ? 'multiple' : 'single'}
  {...rest}
>
  {@render children?.()}
</ComboboxShell>
