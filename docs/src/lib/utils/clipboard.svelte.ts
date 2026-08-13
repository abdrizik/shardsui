export function createClipboard(resetMs = 2000) {
  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  $effect(() => () => clearTimeout(timer))

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      clearTimeout(timer)
      copied = true
      timer = setTimeout(() => (copied = false), resetMs)
    } catch {
      copied = false
    }
  }

  return {
    get copied() {
      return copied
    },

    copy
  }
}
