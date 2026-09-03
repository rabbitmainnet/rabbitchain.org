import { useCallback, useEffect, useMemo, useState } from 'react'
import { canonicalSwapAddress, getSwapTokens, RABBIT_SWAP_FACTORY_ABI, RABBIT_SWAP_TESTNET } from '../config/swap'
import { readRabbitContract, readTokenMetadata } from '../lib/rabbitSwap'

const STORAGE_KEY = 'rabbit.swap.testnet.importedTokens.v1'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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

export function tokenKey(token) {
  if (!token) return ''
  return token.key || (token.native ? 'tRAB' : token.address?.toLowerCase()) || token.symbol
}

export function useRabbitSwapTokens(provider) {
  const [importedTokens, setImportedTokens] = useState(loadImportedTokens)

  const tokens = useMemo(() => {
    const base = getSwapTokens()
    const existing = new Set(base.filter((token) => !token.native && token.address).map((token) => token.address.toLowerCase()))
    const extras = importedTokens.filter((token) => !existing.has(token.address.toLowerCase()))
    return [...base, ...extras]
  }, [importedTokens])

  const importToken = useCallback(async (address) => {
    if (!provider?.request) throw new Error('Connect a wallet on Rabbit Testnet to import a token by address')

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

  return { tokens, importToken }
}

export function useRabbitSwapProtocolFee(provider) {
  const [state, setState] = useState({ enabled: null, feeTo: null })

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      if (!provider?.request) {
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
  }, [provider])

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
