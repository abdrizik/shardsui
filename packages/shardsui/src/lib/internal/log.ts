import { DEV } from 'esm-env'

function createLogger(method: 'warn' | 'error') {
  const seen = new Set<string>()
  return (...messages: string[]) => {
    if (DEV) {
      const messageKey = messages.join(' ')
      if (!seen.has(messageKey)) {
        seen.add(messageKey)
        console[method](`ShardsUI: ${messageKey}`)
      }
    }
  }
}

export const warn = createLogger('warn')
export const error = createLogger('error')
