import { decodeFunctionResult, encodeFunctionData, formatUnits, getAddress, isAddress, parseUnits, toHex } from 'viem'
import { NETWORKS } from '../config/networks'
import {
  RABBIT_SWAP_ERC20_ABI,
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

export async function getPairSnapshot(tokenA, tokenB, account, provider = null) {
  const addressA = canonicalSwapAddress(tokenA)
  const addressB = canonicalSwapAddress(tokenB)
  if (!addressA || !addressB || addressA.toLowerCase() === addressB.toLowerCase()) {
    return { pair: null, reserveA: 0n, reserveB: 0n, totalSupply: 0n, lpBalance: 0n, lpAllowance: 0n }
  }

  let pair = null
  try {
    pair = await readRabbitContract({
      address: RABBIT_SWAP_TESTNET.router,
      abi: RABBIT_SWAP_ROUTER_ABI,
      functionName: 'pairFor',
      args: [addressA, addressB],
      provider,
    })
  } catch {
    const referenceTokens = [RABBIT_SWAP_TESTNET.wrappedNative.toLowerCase(), RABBIT_SWAP_TESTNET.tokens.tRUSD.address.toLowerCase()].sort()
    const requestedTokens = [addressA.toLowerCase(), addressB.toLowerCase()].sort()
    const isReferencePair = referenceTokens[0] === requestedTokens[0] && referenceTokens[1] === requestedTokens[1]
    return {
      pair: isReferencePair ? RABBIT_SWAP_TESTNET.referencePair : null,
      reserveA: 0n,
      reserveB: 0n,
      totalSupply: 0n,
      lpBalance: 0n,
      lpAllowance: 0n,
      readUnavailable: true,
    }
  }

  const zero = '0x0000000000000000000000000000000000000000'
  if (!pair || pair.toLowerCase() === zero) {
    return { pair: null, reserveA: 0n, reserveB: 0n, totalSupply: 0n, lpBalance: 0n, lpAllowance: 0n }
  }

  const reads = await Promise.allSettled([
    readRabbitContract({
      address: RABBIT_SWAP_TESTNET.router,
      abi: RABBIT_SWAP_ROUTER_ABI,
      functionName: 'getReserves',
      args: [addressA, addressB],
      provider,
    }),
    readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'totalSupply', provider }),
    account ? readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'balanceOf', args: [account], provider }) : Promise.resolve(0n),
    account ? readRabbitContract({ address: pair, abi: RABBIT_SWAP_PAIR_ABI, functionName: 'allowance', args: [account, RABBIT_SWAP_TESTNET.router], provider }) : Promise.resolve(0n),
  ])

  const reserves = reads[0].status === 'fulfilled' ? reads[0].value : [0n, 0n]
  return {
    pair,
    reserveA: BigInt(reserves[0] || 0n),
    reserveB: BigInt(reserves[1] || 0n),
    totalSupply: reads[1].status === 'fulfilled' ? BigInt(reads[1].value) : 0n,
    lpBalance: reads[2].status === 'fulfilled' ? BigInt(reads[2].value) : 0n,
    lpAllowance: reads[3].status === 'fulfilled' ? BigInt(reads[3].value) : 0n,
  }
}
