const nav =
  typeof navigator === 'undefined'
    ? undefined
    : (navigator as Navigator & { userAgentData?: { platform?: string } })

const platform = nav?.userAgentData?.platform || nav?.platform || ''
const userAgent = nav?.userAgent ?? ''

export const isMac = platform.toLowerCase().startsWith('mac') && !nav?.maxTouchPoints

export const isAndroid = /android/i.test(platform) || /android/i.test(userAgent)

export const isJSDOM = /jsdom/i.test(userAgent)

export const isWebKit =
  typeof CSS === 'undefined' || !CSS.supports ? false : CSS.supports('-webkit-backdrop-filter:none')

export const isGecko = !isWebKit && userAgent.toLowerCase().includes('firefox')

export const isIOS =
  (platform === 'MacIntel' && (nav?.maxTouchPoints ?? 0) > 1) || /iP(hone|ad|od)|iOS/.test(platform)
