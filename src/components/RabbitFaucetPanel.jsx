import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CheckCircle2, Clock3, Droplets, Pickaxe, RefreshCw, Wallet } from 'lucide-react'
import { decodeFunctionResult, encodeFunctionData, formatUnits } from 'viem'
import { NETWORKS } from '../config/networks'
import { TESTNET_FAUCETS, TRAB_FAUCET_ABI, TRUSD_FAUCET_ABI } from '../config/faucets'
import { friendlyWalletError, shortAddress } from '../lib/wallet'

const TESTNET = NETWORKS.testnet

function formatToken(value, decimals, maximumFractionDigits = 4) {
  if (value === null || value === undefined) return '—'
  const raw = formatUnits(value, decimals)
  const number = Number(raw)
  if (!Number.isFinite(number)) return raw
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(number)
}

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds || 0))
  if (total < 60) return `${Math.ceil(total)} sec`
  if (total < 3600) return `${Math.ceil(total / 60)} min`
  const hours = Math.floor(total / 3600)
  const minutes = Math.ceil((total % 3600) / 60)
  if (!minutes) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function formatCountdown(timestamp) {
  if (!timestamp) return 'Available now'
  const seconds = Number(timestamp) - Math.floor(Date.now() / 1000)
  if (seconds <= 0) return 'Available now'
  return `Available again in ${formatDuration(seconds)}`
}

async function rpc(method, params, provider = null) {
  // When the wallet is connected to Rabbit Testnet, prefer its EIP-1193
  // provider. This avoids browser CORS restrictions on direct RPC reads.
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

async function readContract({ address, abi, functionName, args = [], provider = null }) {
  const data = encodeFunctionData({ abi, functionName, args })
  const result = await rpc('eth_call', [{ to: address, data }, 'latest'], provider)
  return decodeFunctionResult({ abi, functionName, data: result })
}

async function waitForReceipt(hash, provider = null, timeoutMs = 90000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash], provider)
    if (receipt) return receipt
    await new Promise((resolve) => setTimeout(resolve, 1800))
  }
  return null
}

function AssetCard({
  asset,
  amount,
  cooldown,
  balance,
  eligibility,
  connected,
  correctNetwork,
  hasNativeGas,
  pending,
  onClaim,
  onConnect,
  onSwitchNetwork,
}) {
  const explorer = `${TESTNET.explorerUrl}/address/${asset.address}`
  const isNative = asset.key === 'tRAB'
  const ready = eligibility?.eligible === true
  const unavailable = eligibility?.eligible === false
  const needsMining = connected && correctNetwork && hasNativeGas === false

  let actionLabel = `Request ${asset.symbol}`
  if (!connected) actionLabel = 'Connect wallet'
  else if (!correctNetwork) actionLabel = 'Switch to Rabbit Testnet'
  else if (needsMining) actionLabel = 'Mine tRAB first'
  else if (pending) actionLabel = 'Waiting for confirmation…'
  else if (unavailable) actionLabel = formatCountdown(eligibility.availableAt)

  return (
    <article className="faucet-live-card">
      <div className="faucet-live-head">
        <div className="faucet-token-mark"><img src={asset.logo} alt={`${asset.symbol} logo`} /></div>
        <div>
          <span>{asset.name}</span>
          <strong>{asset.symbol}</strong>
        </div>
        <em>{asset.mode === 'funded' ? 'FUNDED' : 'AUTONOMOUS'}</em>
      </div>

      <p>
        {isNative
          ? 'Native Rabbit Testnet gas asset. The public faucet is for active testnet participants; new wallets should earn their first tRAB by mining.'
          : 'USD-denominated test asset for application testing. A small tRAB balance is required to pay network gas.'}
      </p>

      <div className="faucet-live-stats faucet-live-stats-prominent">
        <div>
          <span>YOU RECEIVE</span>
          <strong>{formatToken(amount ?? asset.defaultClaimAmount, asset.decimals, 2)} {asset.symbol}</strong>
        </div>
        <div>
          <span>CLAIM AGAIN AFTER</span>
          <strong>{formatDuration(cooldown ?? asset.defaultCooldown)}</strong>
        </div>
        {isNative && (
          <div>
            <span>FAUCET BALANCE</span>
            <strong>{balance === null || balance === undefined ? 'On-chain funded' : `${formatToken(balance, 18, 2)} tRAB`}</strong>
          </div>
        )}
      </div>

      {needsMining && (
        <div className="faucet-participant-note">
          <Pickaxe size={15} />
          <span><b>First time here?</b> Mine tRAB with Rabbit Core first. Your mined tRAB pays the gas needed to use both faucets.</span>
        </div>
      )}

      {connected && correctNetwork && hasNativeGas !== false && eligibility && (
        <div className={`faucet-availability ${ready ? 'ready' : ''}`}>
          {ready ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
          <span>{ready ? `Ready now · receive ${formatToken(amount ?? asset.defaultClaimAmount, asset.decimals, 2)} ${asset.symbol}` : formatCountdown(eligibility.availableAt)}</span>
        </div>
      )}

      {needsMining ? (
        <Link className="product-action faucet-claim-button faucet-mining-button" to="/mining">
          <Pickaxe size={15} />
          {actionLabel}
        </Link>
      ) : (
        <button
          className="product-action faucet-claim-button"
          disabled={pending || (connected && correctNetwork && unavailable)}
          onClick={!connected ? onConnect : !correctNetwork ? onSwitchNetwork : onClaim}
        >
          {pending ? <RefreshCw className="spin" size={15} /> : <Droplets size={15} />}
          {actionLabel}
        </button>
      )}

      <div className="faucet-contract-line">
        <span>CONTRACT</span>
        <code>{shortAddress(asset.address)}</code>
        <a href={explorer} target="_blank" rel="noreferrer">Explorer <ArrowUpRight size={12} /></a>
      </div>
    </article>
  )
}

export default function RabbitFaucetPanel({
  walletState,
  walletProvider,
  onConnect,
  onSwitchNetwork,
  toast,
}) {
  const account = walletState?.account || null
  const correctNetwork = walletState?.chainId === TESTNET.chainId
  const [state, setState] = useState({
    loading: true,
    tRABAmount: TESTNET_FAUCETS.tRAB.defaultClaimAmount,
    tRABCooldown: TESTNET_FAUCETS.tRAB.defaultCooldown,
    tRABBalance: null,
    walletNativeBalance: null,
    tRABEligibility: null,
    tRUSDAmount: TESTNET_FAUCETS.tRUSD.defaultClaimAmount,
    tRUSDCooldown: TESTNET_FAUCETS.tRUSD.defaultCooldown,
    tRUSDEligibility: null,
  })
  const [pending, setPending] = useState(null)
  const [, setClock] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setClock((value) => value + 1), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }))

    const provider = correctNetwork && walletProvider?.request ? walletProvider : null

    // Each read is independent. A temporary public-RPC browser failure must not
    // replace the faucet UI with a raw networking error or hide claim rules.
    const reads = await Promise.allSettled([
      readContract({ address: TESTNET_FAUCETS.tRAB.address, abi: TRAB_FAUCET_ABI, functionName: 'claimAmount', provider }),
      readContract({ address: TESTNET_FAUCETS.tRAB.address, abi: TRAB_FAUCET_ABI, functionName: 'cooldown', provider }),
      rpc('eth_getBalance', [TESTNET_FAUCETS.tRAB.address, 'latest'], provider),
      readContract({ address: TESTNET_FAUCETS.tRUSD.address, abi: TRUSD_FAUCET_ABI, functionName: 'faucetAmount', provider }),
      readContract({ address: TESTNET_FAUCETS.tRUSD.address, abi: TRUSD_FAUCET_ABI, functionName: 'faucetCooldown', provider }),
    ])

    const next = {
      loading: false,
      tRABAmount: reads[0].status === 'fulfilled' ? reads[0].value : TESTNET_FAUCETS.tRAB.defaultClaimAmount,
      tRABCooldown: reads[1].status === 'fulfilled' ? reads[1].value : TESTNET_FAUCETS.tRAB.defaultCooldown,
      tRABBalance: reads[2].status === 'fulfilled' ? BigInt(reads[2].value) : null,
      walletNativeBalance: null,
      tRABEligibility: null,
      tRUSDAmount: reads[3].status === 'fulfilled' ? reads[3].value : TESTNET_FAUCETS.tRUSD.defaultClaimAmount,
      tRUSDCooldown: reads[4].status === 'fulfilled' ? reads[4].value : TESTNET_FAUCETS.tRUSD.defaultCooldown,
      tRUSDEligibility: null,
    }

    if (account && correctNetwork && provider) {
      const accountReads = await Promise.allSettled([
        rpc('eth_getBalance', [account, 'latest'], provider),
        readContract({
          address: TESTNET_FAUCETS.tRAB.address,
          abi: TRAB_FAUCET_ABI,
          functionName: 'canClaim',
          args: [account],
          provider,
        }),
        readContract({
          address: TESTNET_FAUCETS.tRUSD.address,
          abi: TRUSD_FAUCET_ABI,
          functionName: 'canClaimFaucet',
          args: [account],
          provider,
        }),
      ])

      if (accountReads[0].status === 'fulfilled') next.walletNativeBalance = BigInt(accountReads[0].value)

      if (accountReads[1].status === 'fulfilled') {
        const nativeClaim = accountReads[1].value
        next.tRABEligibility = {
          eligible: nativeClaim[0],
          availableAt: nativeClaim[1],
          amount: nativeClaim[2],
          faucetBalance: nativeClaim[3],
        }
      }

      if (accountReads[2].status === 'fulfilled') {
        const rusdClaim = accountReads[2].value
        next.tRUSDEligibility = {
          eligible: rusdClaim[0],
          availableAt: rusdClaim[1],
          amount: rusdClaim[2],
        }
      }
    }

    setState(next)
  }, [account, correctNetwork, walletProvider])

  useEffect(() => {
    refresh()
  }, [refresh])

  const networkStatus = useMemo(() => {
    if (!account) return 'Connect your wallet to use the participant faucet.'
    if (!correctNetwork) return 'Switch to Rabbit Testnet to continue.'
    return `Connected: ${shortAddress(account)} · Rabbit Testnet`
  }, [account, correctNetwork])

  const hasNativeGas = state.walletNativeBalance === null
    ? null
    : state.walletNativeBalance > 0n

  async function claim(assetKey) {
    if (!account) return onConnect?.()
    if (!correctNetwork) return onSwitchNetwork?.(TESTNET)
    if (hasNativeGas === false) {
      toast?.('Mine tRAB first. Native tRAB is required to pay Rabbit Testnet gas.')
      return
    }
    if (!walletProvider?.request) {
      toast?.('Wallet provider is not available')
      return
    }

    const asset = TESTNET_FAUCETS[assetKey]
    const abi = assetKey === 'tRAB' ? TRAB_FAUCET_ABI : TRUSD_FAUCET_ABI
    const functionName = assetKey === 'tRAB' ? 'claim' : 'claimFaucet'

    try {
      setPending(assetKey)
      const data = encodeFunctionData({ abi, functionName })
      const hash = await walletProvider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: asset.address,
          data,
          value: '0x0',
        }],
      })

      toast?.(`${asset.symbol} faucet transaction submitted`)
      const receipt = await waitForReceipt(hash, walletProvider)
      if (receipt?.status === '0x0') throw new Error(`${asset.symbol} faucet transaction reverted`)
      toast?.(receipt ? `${asset.symbol} received from faucet` : `${asset.symbol} transaction submitted; confirmation is taking longer than expected`)
      await refresh()
    } catch (error) {
      toast?.(friendlyWalletError(error, `${asset.symbol} faucet request failed`))
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="product-panel product-faucet product-faucet-live">
      <div className="product-panel-title">
        <div><Droplets size={20} /><span>PARTICIPANT FAUCET</span></div>
        <b className="faucet-live-badge">LIVE</b>
      </div>

      <div className="faucet-intro faucet-intro-live">
        <div>
          <h3>Rabbit Testnet Participant Faucet</h3>
          <p>Built for miners, builders and testers actively using Rabbit Testnet. New wallets should first mine tRAB with Rabbit Core; tRAB is the native gas required to use the faucet contracts.</p>
        </div>
        <button className="faucet-refresh" onClick={refresh} disabled={state.loading} aria-label="Refresh faucet status">
          <RefreshCw className={state.loading ? 'spin' : ''} size={15} /> Refresh
        </button>
      </div>

      <div className="faucet-participation-banner">
        <Pickaxe size={18} />
        <div>
          <strong>Participate first. Test more with the faucet.</strong>
          <span>Mine your first tRAB → pay Rabbit Testnet gas → claim 10 tRAB and 1,000 tRUSD every 24 hours for continued testing.</span>
        </div>
        <Link to="/mining">Start mining <ArrowUpRight size={13} /></Link>
      </div>

      <div className={`faucet-wallet-state ${account && correctNetwork ? 'ready' : ''}`}>
        {account && correctNetwork ? <CheckCircle2 size={16} /> : <Wallet size={16} />}
        <span>{networkStatus}</span>
      </div>

      <div className="faucet-live-grid">
        <AssetCard
          asset={TESTNET_FAUCETS.tRAB}
          amount={state.tRABAmount}
          cooldown={state.tRABCooldown}
          balance={state.tRABBalance}
          eligibility={state.tRABEligibility}
          connected={Boolean(account)}
          correctNetwork={correctNetwork}
          hasNativeGas={hasNativeGas}
          pending={pending === 'tRAB'}
          onClaim={() => claim('tRAB')}
          onConnect={onConnect}
          onSwitchNetwork={() => onSwitchNetwork?.(TESTNET)}
        />

        <AssetCard
          asset={TESTNET_FAUCETS.tRUSD}
          amount={state.tRUSDAmount}
          cooldown={state.tRUSDCooldown}
          eligibility={state.tRUSDEligibility}
          connected={Boolean(account)}
          correctNetwork={correctNetwork}
          hasNativeGas={hasNativeGas}
          pending={pending === 'tRUSD'}
          onClaim={() => claim('tRUSD')}
          onConnect={onConnect}
          onSwitchNetwork={() => onSwitchNetwork?.(TESTNET)}
        />
      </div>

      <p className="product-disclaimer faucet-live-disclaimer">
        Testnet assets only. Each successful claim currently provides 10 tRAB or 1,000 tRUSD, with a 24-hour per-wallet cooldown. Contract values are read on-chain when available. tRAB and tRUSD have no guaranteed monetary value. The faucet does not prove mining history on-chain; requiring native tRAB for transaction gas makes mining the intended public entry path for a new wallet.
      </p>
    </div>
  )
}
