import { decodeFunctionResult, encodeFunctionData, formatUnits, getAddress, isAddress, parseUnits, toHex } from 'viem'
import { NETWORKS } from '../config/networks'
import {
  RABBIT_SWAP_ERC20_ABI,
  RABBIT_SWAP_FACTORY_ABI,
  RABBIT_SWAP_PAIR_ABI,
  RABBIT_SWAP_ROUTER_ABI,
  RABBIT_SWAP_TESTNET,
  canonicalSwapAddress,
} from '../config/swap'

const TESTNET = NETWORKS.testnet

export function cleanDecimalInput(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '')
  const first = cleaned.indexOf('.')
  if (first === -1) return cleaned
  return `${cleaned.slice(0, first + 1)}${cleaned.slice(first + 1).replace(/\./g, '')}`
}

export function parseTokenAmount(value, decimals) {
  const normalized = String(value || '').trim()
  if (!normalized || normalized === '.') return 0n
  return parseUnits(normalized, decimals)
}

export function formatTokenAmount(value, decimals, maximumFractionDigits = 6) {
  if (value === null || value === undefined) return '—'
  const raw = formatUnits(BigInt(value), decimals)
  const number = Number(raw)
  if (!Number.isFinite(number)) return raw
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(number)
}

export function formatInputAmount(value, decimals, significant = 8) {
  if (value === null || value === undefined) return ''
  const raw = formatUnits(BigInt(value), decimals)
  if (!raw.includes('.')) return raw
  const [whole, fraction] = raw.split('.')
  const trimmed = fraction.slice(0, significant).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole
}

export function deadlineIn(seconds = 20 * 60) {
  return BigInt(Math.floor(Date.now() / 1000) + seconds)
}

export function applySlippage(value, bps = RABBIT_SWAP_TESTNET.slippageBps) {
  return (BigInt(value) * (10_000n - BigInt(bps))) / 10_000n
}

export async function rabbitRpc(method, params, provider = null) {
  if (provider?.request) {
    return provider.request({ method, params })
  }

  const response = await fetch(TESTNET.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })

  if (!response.ok) throw new Error(`Rabbit RPC returned HTTP ${response.status}`)
  const payload = await response.json()
  if (payload?.error) throw new Error(payload.error.message || 'Rabbit RPC request failed')
  return payload.result
}

export async function readRabbitContract({ address, abi, functionName, args = [], provider = null }) {
  const data = encodeFunctionData({ abi, functionName, args })
  const result = await rabbitRpc('eth_call', [{ to: address, data }, 'latest'], provider)
  return decodeFunctionResult({ abi, functionName, data: result })
}

export async function waitForRabbitReceipt(hash, provider = null, timeoutMs = 90000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const receipt = await rabbitRpc('eth_getTransactionReceipt', [hash], provider)
    if (receipt) return receipt
    await new Promise((resolve) => setTimeout(resolve, 1600))
  }
  return null
}

export async function sendRabbitContract({ provider, account, address, abi, functionName, args = [], value = 0n }) {
  const data = encodeFunctionData({ abi, functionName, args })
  return provider.request({
    method: 'eth_sendTransaction',
    params: [{
      from: account,
      to: address,
      data,
      value: toHex(BigInt(value)),
    }],
  })
}


export async function readTokenMetadata(address, provider = null) {
  const input = String(address || '').trim()
  if (!isAddress(input, { strict: false })) throw new Error('Invalid token contract address')
  const normalized = getAddress(input.toLowerCase())
  const code = await rabbitRpc('eth_getCode', [normalized, 'latest'], provider)
  if (!code || code === '0x' || code === '0x0') throw new Error('No contract found at this address on Rabbit Testnet')

  const reads = await Promise.all([
    readRabbitContract({ address: normalized, abi: RABBIT_SWAP_ERC20_ABI, functionName: 'name', provider }),
    readRabbitContract({ address: normalized, abi: RABBIT_SWAP_ERC20_ABI, functionName: 'symbol', provider }),
    readRabbitContract({ address: normalized, abi: RABBIT_SWAP_ERC20_ABI, functionName: 'decimals', provider }),
  ])

  const decimals = Number(reads[2])
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) throw new Error('Unsupported token decimals')
  const name = String(reads[0] || '').trim()
  const symbol = String(reads[1] || '').trim()
  if (!name || !symbol) throw new Error('Token metadata could not be read')

  return { address: normalized, name, symbol, decimals }
}

export async function readTokenBalance(token, account, provider = null) {
  if (!token || !account) return null
  if (token.native) {
    return BigInt(await rabbitRpc('eth_getBalance', [account, 'latest'], provider))
  }
  return readRabbitContract({
    address: token.address,
    abi: RABBIT_SWAP_ERC20_ABI,
    functionName: 'balanceOf',
    args: [account],
    provider,
  })
}

export async function readAllowance(tokenAddress, owner, spender, provider = null, abi = RABBIT_SWAP_ERC20_ABI) {
  if (!tokenAddress || !owner || !spender) return 0n
  return readRabbitContract({
    address: tokenAddress,
    abi,
    functionName: 'allowance',
    args: [owner, spender],
    provider,
  })
}

export async function approveExact({ provider, account, tokenAddress, spender, amount, currentAllowance = 0n, abi = RABBIT_SWAP_ERC20_ABI, onReset }) {
  const wanted = BigInt(amount)
  const existing = BigInt(currentAllowance || 0n)

  if (existing >= wanted) return null

  if (existing > 0n) {
    onReset?.()
    const resetHash = await sendRabbitContract({
      provider,
      account,
      address: tokenAddress,
      abi,
      functionName: 'approve',
      args: [spender, 0n],
    })
    const resetReceipt = await waitForRabbitReceipt(resetHash, provider)
    if (resetReceipt?.status === '0x0') throw new Error('Approval reset reverted')
  }

  const hash = await sendRabbitContract({
    provider,
    account,
    address: tokenAddress,
    abi,
    functionName: 'approve',
    args: [spender, wanted],
  })
  const receipt = await waitForRabbitReceipt(hash, provider)
  if (receipt?.status === '0x0') throw new Error('Token approval reverted')
  return hash
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ROUTE_MAX_HOPS = 3
const ROUTE_MAX_CANDIDATES = 24
const tokenMetadataCache = new Map()

function lowerAddress(value) {
  return String(value || '').toLowerCase()
}

async function mapInBatches(items, batchSize, mapper) {
  const out = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const values = await Promise.all(batch.map(mapper))
    out.push(...values)
  }
  return out
}

export async function discoverRabbitSwapPools(provider = null) {
  const rawLength = await readRabbitContract({
    address: RABBIT_SWAP_TESTNET.factory,
    abi: RABBIT_SWAP_FACTORY_ABI,
    functionName: 'allPairsLength',
    provider,
  })
  const length = Number(BigInt(rawLength))
  if (!Number.isSafeInteger(length) || length < 0) throw new Error('RabbitSwap Factory returned an invalid pair count')
  if (length === 0) return []

  const indexes = Array.from({ length }, (_, index) => BigInt(index))
  const pairAddresses = await mapInBatches(indexes, 12, async (index) => readRabbitContract({
    address: RABBIT_SWAP_TESTNET.factory,
    abi: RABBIT_SWAP_FACTORY_ABI,
    functionName: 'allPairs',
    args: [index],
    provider,
  }))

  const pools = await mapInBatches(pairAddresses, 8, async (pair) => {
    const [token0, token1] = await Promise.all([
      readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'token0', provider }),
      readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'token1', provider }),
    ])
    return {
      pair: String(pair),
      token0: String(token0),
      token1: String(token1),
    }
  })

  return pools.filter((pool) => pool.pair && lowerAddress(pool.pair) !== ZERO_ADDRESS)
}

export async function readPoolDiscoveredTokens(pools, provider = null) {
  const base = Object.values(RABBIT_SWAP_TESTNET.tokens)
  const known = new Set(base.filter((token) => token.address).map((token) => lowerAddress(token.address)))
  const addresses = []

  for (const pool of pools || []) {
    for (const address of [pool.token0, pool.token1]) {
      const key = lowerAddress(address)
      if (!key || key === ZERO_ADDRESS || known.has(key)) continue
      known.add(key)
      addresses.push(address)
    }
  }

  const results = await mapInBatches(addresses, 6, async (address) => {
    const key = lowerAddress(address)
    if (tokenMetadataCache.has(key)) return tokenMetadataCache.get(key)
    try {
      const metadata = await readTokenMetadata(address, provider)
      const token = {
        key,
        symbol: metadata.symbol,
        name: metadata.name,
        description: 'Discovered from a live RabbitSwap pool',
        decimals: metadata.decimals,
        native: false,
        address: metadata.address,
        logo: null,
        discovered: true,
      }
      tokenMetadataCache.set(key, token)
      return token
    } catch {
      return null
    }
  })

  return results.filter(Boolean)
}

function routeGraph(pools) {
  const graph = new Map()
  const link = (a, b) => {
    const key = lowerAddress(a)
    const value = lowerAddress(b)
    if (!key || !value) return
    if (!graph.has(key)) graph.set(key, new Set())
    graph.get(key).add(value)
  }

  for (const pool of pools || []) {
    link(pool.token0, pool.token1)
    link(pool.token1, pool.token0)
  }
  return graph
}

export function buildSwapRouteCandidates(fromToken, toToken, pools, maxHops = ROUTE_MAX_HOPS) {
  const from = lowerAddress(canonicalSwapAddress(fromToken))
  const to = lowerAddress(canonicalSwapAddress(toToken))
  if (!from || !to || from === to) return []

  const graph = routeGraph(pools)
  const routes = [[from, to]] // Always probe the direct pair, even during the first Factory scan.
  const seen = new Set([`${from}>${to}`])
  const queue = [[from]]

  while (queue.length && routes.length < ROUTE_MAX_CANDIDATES) {
    const current = queue.shift()
    const last = current[current.length - 1]
    const hops = current.length - 1
    if (hops >= maxHops) continue

    for (const next of graph.get(last) || []) {
      if (current.includes(next)) continue
      const candidate = [...current, next]
      if (next === to) {
        const key = candidate.join('>')
        if (!seen.has(key)) {
          seen.add(key)
          routes.push(candidate)
          if (routes.length >= ROUTE_MAX_CANDIDATES) break
        }
      } else if (candidate.length - 1 < maxHops) {
        queue.push(candidate)
      }
    }
  }

  return routes
}

async function readSpotOutputForPath(amountIn, path, provider = null) {
  const reserveReads = await Promise.all(path.slice(0, -1).map((token, index) => readRabbitContract({
    address: RABBIT_SWAP_TESTNET.router,
    abi: RABBIT_SWAP_ROUTER_ABI,
    functionName: 'getReserves',
    args: [token, path[index + 1]],
    provider,
  })))

  let amount = BigInt(amountIn)
  for (const reserves of reserveReads) {
    const reserveIn = BigInt(reserves[0] || 0n)
    const reserveOut = BigInt(reserves[1] || 0n)
    if (reserveIn <= 0n || reserveOut <= 0n) return null
    amount = (amount * reserveOut) / reserveIn
  }
  return amount
}

export async function quoteBestSwapRoute({ amountIn, fromToken, toToken, pools = [], provider = null }) {
  const input = BigInt(amountIn || 0n)
  if (input <= 0n) return null
  const routes = buildSwapRouteCandidates(fromToken, toToken, pools)
  if (!routes.length) return null

  const quotes = await mapInBatches(routes, 6, async (path) => {
    try {
      const amounts = await readRabbitContract({
        address: RABBIT_SWAP_TESTNET.router,
        abi: RABBIT_SWAP_ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: [input, path],
        provider,
      })
      const normalizedAmounts = amounts.map((value) => BigInt(value))
      const amountOut = normalizedAmounts[normalizedAmounts.length - 1]
      return amountOut > 0n ? { path, amounts: normalizedAmounts, amountOut } : null
    } catch {
      return null
    }
  })

  let best = null
  for (const candidate of quotes) {
    if (!candidate) continue
    if (!best || candidate.amountOut > best.amountOut) best = candidate
  }
  if (!best) return null

  try {
    best.spotOutput = await readSpotOutputForPath(input, best.path, provider)
  } catch {
    best.spotOutput = null
  }
  return best
}

export async function getWalletLiquidityPositions(pools, account, provider = null) {
  if (!account || !Array.isArray(pools) || pools.length === 0) return []

  const balances = await mapInBatches(pools, 10, async (pool) => {
    try {
      const balance = await readRabbitContract({
        address: pool.pair,
        abi: RABBIT_SWAP_PAIR_ABI,
        functionName: 'balanceOf',
        args: [account],
        provider,
      })
      return { pool, lpBalance: BigInt(balance) }
    } catch {
      return { pool, lpBalance: 0n }
    }
  })

  const owned = balances.filter((item) => item.lpBalance > 0n)
  return mapInBatches(owned, 5, async ({ pool, lpBalance }) => {
    const reads = await Promise.allSettled([
      readRabbitContract({ address: pool.pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'totalSupply', provider }),
      readRabbitContract({ address: pool.pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'getReserves', provider }),
      readRabbitContract({ address: pool.pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'allowance', args: [account, RABBIT_SWAP_TESTNET.router], provider }),
    ])
    const totalSupply = reads[0].status === 'fulfilled' ? BigInt(reads[0].value) : 0n
    const reserves = reads[1].status === 'fulfilled' ? reads[1].value : [0n, 0n, 0]
    const reserve0 = BigInt(reserves[0] || 0n)
    const reserve1 = BigInt(reserves[1] || 0n)
    const lpAllowance = reads[2].status === 'fulfilled' ? BigInt(reads[2].value) : 0n
    return {
      ...pool,
      reserve0,
      reserve1,
      totalSupply,
      lpBalance,
      lpAllowance,
      amount0: totalSupply > 0n ? (lpBalance * reserve0) / totalSupply : 0n,
      amount1: totalSupply > 0n ? (lpBalance * reserve1) / totalSupply : 0n,
    }
  })
}

export async function getPairSnapshot(tokenA, tokenB, account, provider = null) {
  const addressA = canonicalSwapAddress(tokenA)
  const addressB = canonicalSwapAddress(tokenB)
  if (!addressA || !addressB || lowerAddress(addressA) === lowerAddress(addressB)) {
    return { pair: null, reserveA: 0n, reserveB: 0n, totalSupply: 0n, lpBalance: 0n, lpAllowance: 0n }
  }

  const pair = await readRabbitContract({
    address: RABBIT_SWAP_TESTNET.factory,
    abi: RABBIT_SWAP_FACTORY_ABI,
    functionName: 'getPair',
    args: [addressA, addressB],
    provider,
  })

  if (!pair || lowerAddress(pair) === ZERO_ADDRESS) {
    return { pair: null, reserveA: 0n, reserveB: 0n, totalSupply: 0n, lpBalance: 0n, lpAllowance: 0n }
  }

  const reads = await Promise.allSettled([
    readRabbitContract({ address: RABBIT_SWAP_TESTNET.router, abi: RABBIT_SWAP_ROUTER_ABI, functionName: 'getReserves', args: [addressA, addressB], provider }),
    readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'totalSupply', provider }),
    account ? readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'balanceOf', args: [account], provider }) : Promise.resolve(0n),
    account ? readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'allowance', args: [account, RABBIT_SWAP_TESTNET.router], provider }) : Promise.resolve(0n),
  ])

  const reserves = reads[0].status === 'fulfilled' ? reads[0].value : [0n, 0n]
  return {
    pair: String(pair),
    reserveA: BigInt(reserves[0] || 0n),
    reserveB: BigInt(reserves[1] || 0n),
    totalSupply: reads[1].status === 'fulfilled' ? BigInt(reads[1].value) : 0n,
    lpBalance: reads[2].status === 'fulfilled' ? BigInt(reads[2].value) : 0n,
    lpAllowance: reads[3].status === 'fulfilled' ? BigInt(reads[3].value) : 0n,
  }
}
