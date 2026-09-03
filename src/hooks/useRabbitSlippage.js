import { useEffect, useState } from 'react'

export const RABBIT_SLIPPAGE_STORAGE_KEY = 'rabbit-platform-slippage-bps'
export const DEFAULT_RABBIT_SLIPPAGE_BPS = 50
export const MIN_RABBIT_SLIPPAGE_BPS = 1
export const MAX_RABBIT_SLIPPAGE_BPS = 5_000

function clampSlippageBps(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_RABBIT_SLIPPAGE_BPS
  return Math.min(MAX_RABBIT_SLIPPAGE_BPS, Math.max(MIN_RABBIT_SLIPPAGE_BPS, Math.round(parsed)))
}

function readStoredSlippage() {
  if (typeof window === 'undefined') return DEFAULT_RABBIT_SLIPPAGE_BPS
  const stored = window.localStorage.getItem(RABBIT_SLIPPAGE_STORAGE_KEY)
  return stored === null ? DEFAULT_RABBIT_SLIPPAGE_BPS : clampSlippageBps(stored)
}

export function formatSlippagePercent(bps) {
  const value = Number(bps) / 100
  if (value >= 10) return value.toFixed(1)
  if (value >= 1) return value.toFixed(2).replace(/0$/, '')
  return value.toFixed(2)
}

export function useRabbitSlippage() {
  const [slippageBps, setSlippageState] = useState(readStoredSlippage)

  useEffect(() => {
    function sync(event) {
      if (event?.key && event.key !== RABBIT_SLIPPAGE_STORAGE_KEY) return
      setSlippageState(readStoredSlippage())
    }

    window.addEventListener('storage', sync)
    window.addEventListener('rabbit-slippage-change', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('rabbit-slippage-change', sync)
    }
  }, [])

  function setSlippageBps(next) {
    const normalized = clampSlippageBps(next)
    setSlippageState(normalized)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(RABBIT_SLIPPAGE_STORAGE_KEY, String(normalized))
      window.dispatchEvent(new Event('rabbit-slippage-change'))
    }
  }

  return {
    slippageBps,
    slippageLabel: formatSlippagePercent(slippageBps),
    setSlippageBps,
  }
}
