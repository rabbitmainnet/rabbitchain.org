import { useCallback, useEffect, useMemo, useState } from 'react'
import { canonicalSwapAddress, getSwapTokens, RABBIT_SWAP_FACTORY_ABI, RABBIT_SWAP_TESTNET } from '../config/swap'
import {
  discoverRabbitSwapPools,
  readPoolDiscoveredTokens,
  readRabbitContract,
  readTokenMetadata,
} from '../lib/rabbitSwap'

const STORAGE_KEY = 'rabbit.swap.testnet.importedTokens.v1'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const FACTORY_REFRESH_MS = 20_000

function loadImportedTokens() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((token) => token && token.address && token.symbol && Number.isInteger(token.decimals))
  } catch {
    return []
  }
}

function persistImportedTokens(tokens) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens)) } catch {}
}

function canonicalTokenAddress(token) {
  return canonicalSwapAddress(token)?.toLowerCase() || ''
}

export function tokenKey(token) {
  if (!token) return ''
  return token.key || (token.native ? 'tRAB' : token.address?.toLowerCase()) || token.symbol
}

export function useRabbitSwapTokens(provider, enabled = true) {
  const [importedTokens, setImportedTokens] = useState(loadImportedTokens)
  const [discoveredTokens, setDiscoveredTokens] = useState([])
  const [pools, setPools] = useState([])
  const [poolsLoading, setPoolsLoading] = useState(Boolean(enabled))
  const [poolError, setPoolError] = useState(null)

  const tokens = useMemo(() => {
    const merged = []
    const seen = new Set()
    const add = (token) => {
      if (!token) return
      // Keep tRAB and tWRAB as separate user-facing choices even though both route
      // through the same wrapped-native address. All other ERC-20s dedupe by address.
      const key = token.native ? 'native:trab' : canonicalTokenAddress(token)
      if (!key || seen.has(key)) return
      seen.add(key)
      merged.push(token)
    }
    getSwapTokens().forEach(add)
    discoveredTokens.forEach(add)
    importedTokens.forEach(add)
    return merged
  }, [discoveredTokens, importedTokens])

  const refreshPools = useCallback(async () => {
    if (!enabled) {
      setPools([])
      setDiscoveredTokens([])
      setPoolsLoading(false)
      setPoolError(null)
      return []
    }

    setPoolsLoading(true)
    try {
      const nextPools = await discoverRabbitSwapPools(provider)
      const nextTokens = await readPoolDiscoveredTokens(nextPools, provider)
      setPools(nextPools)
      setDiscoveredTokens(nextTokens)
      setPoolError(null)
      return nextPools
    } catch (error) {
      setPoolError(error)
      return null
    } finally {
      setPoolsLoading(false)
    }
  }, [enabled, provider])

  useEffect(() => {
    let cancelled = false
    let timer = null

    const tick = async () => {
      if (cancelled) return
      await refreshPools()
      if (!cancelled) timer = window.setTimeout(tick, FACTORY_REFRESH_MS)
    }

    tick()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [refreshPools])

  const importToken = useCallback(async (address) => {
    const existing = tokens.find((token) => !token.native && token.address?.toLowerCase() === String(address).trim().toLowerCase())
    if (existing) return existing

    const metadata = await readTokenMetadata(address, provider)
    const token = {
      key: metadata.address.toLowerCase(),
      symbol: metadata.symbol,
      name: metadata.name,
      description: `Imported ERC-20 · ${metadata.decimals} decimals`,
      decimals: metadata.decimals,
      native: false,
      address: metadata.address,
      logo: null,
      imported: true,
    }

    setImportedTokens((current) => {
      const next = [...current.filter((item) => item.address?.toLowerCase() !== token.address.toLowerCase()), token]
      persistImportedTokens(next)
      return next
    })

    return token
  }, [provider, tokens])

  return { tokens, importToken, pools, poolsLoading, poolError, refreshPools }
}

export function useRabbitSwapProtocolFee(provider, enabled = true) {
  const [state, setState] = useState({ enabled: null, feeTo: null })

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      if (!enabled) {
        setState({ enabled: null, feeTo: null })
        return
      }
      try {
        const feeTo = await readRabbitContract({
          address: RABBIT_SWAP_TESTNET.factory,
          abi: RABBIT_SWAP_FACTORY_ABI,
          functionName: 'feeTo',
          provider,
        })
        if (!cancelled) setState({ enabled: feeTo.toLowerCase() !== ZERO_ADDRESS, feeTo })
      } catch {
        if (!cancelled) setState({ enabled: null, feeTo: null })
      }
    }

    refresh()
    return () => { cancelled = true }
  }, [provider, enabled])

  return state
}

export function filterSwapTokens(tokens, query, otherToken = null) {
  const normalized = String(query || '').trim().toLowerCase()
  const otherCanonical = canonicalSwapAddress(otherToken)?.toLowerCase()
  return tokens.filter((token) => {
    if (canonicalSwapAddress(token)?.toLowerCase() === otherCanonical) return false
    if (!normalized) return true
    return token.symbol?.toLowerCase().includes(normalized)
      || token.name?.toLowerCase().includes(normalized)
      || token.address?.toLowerCase().includes(normalized)
  })
}
