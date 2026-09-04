import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUpRight, CheckCircle2, RefreshCw, Search, Wallet } from 'lucide-react'
import { NETWORKS } from '../config/networks'
import { PLATFORM_NETWORKS } from '../config/platform'
import {
  RABBIT_SWAP_ERC20_ABI,
  RABBIT_SWAP_ROUTER_ABI,
  RABBIT_SWAP_TESTNET,
  canonicalSwapAddress,
} from '../config/swap'
import {
  applySlippage,
  approveExact,
  cleanDecimalInput,
  deadlineIn,
  formatTokenAmount,
  parseTokenAmount,
  quoteBestSwapRoute,
  readAllowance,
  readTokenBalance,
  sendRabbitContract,
  waitForRabbitReceipt,
} from '../lib/rabbitSwap'
import { friendlyWalletError, shortAddress } from '../lib/wallet'
import RabbitSlippageSettings from './RabbitSlippageSettings'
import { useRabbitSlippage } from '../hooks/useRabbitSlippage'
import { filterSwapTokens, tokenKey, useRabbitSwapProtocolFee, useRabbitSwapTokens } from '../hooks/useRabbitSwapTokens'

function TokenLogo({ token }) {
  if (token?.logo) {
    return <span className="rabbit-token-logo"><img src={token.logo} alt={`${token.symbol} logo`} /></span>
  }
  return <span className="rabbit-token-logo rabbit-token-logo-fallback">{token?.symbol?.slice(-1) || '?'}</span>
}

function TokenSelector({ token, tokens, open, onToggle, onSelect, onImportToken, otherToken }) {
  const [query, setQuery] = useState('')
  const [importing, setImporting] = useState(false)
  const candidates = filterSwapTokens(tokens, query, otherToken)
  const normalized = query.trim()
  const canImport = /^0x[0-9a-fA-F]{40}$/.test(normalized)
    && !tokens.some((item) => !item.native && item.address?.toLowerCase() === normalized.toLowerCase())

  async function handleImport() {
    if (!canImport || !onImportToken) return
    setImporting(true)
    try {
      const imported = await onImportToken(normalized)
      if (imported) {
        onSelect(tokenKey(imported))
        setQuery('')
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="rabbit-token-selector">
      <button type="button" className="rabbit-token-button" onClick={onToggle}>
        <TokenLogo token={token} />
        <span><b>{token?.symbol || 'Select token'}</b><small>{token?.name || 'Rabbit Testnet'}</small></span>
        <ArrowDown size={15} />
      </button>

      {open && (
        <div className="rabbit-token-menu">
          <div className="rabbit-token-menu-head"><b>Select token</b><small>Rabbit Testnet</small></div>
          <div className="rabbit-token-search">
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbol, name or 0x address" autoFocus />
          </div>
          {candidates.map((item) => (
            <button key={tokenKey(item)} type="button" onClick={() => onSelect(tokenKey(item))}>
              <TokenLogo token={item} />
              <span><b>{item.symbol}</b><small>{item.imported ? `${shortAddress(item.address)} · imported token` : item.discovered ? `${shortAddress(item.address)} · live pool token` : item.description}</small></span>
            </button>
          ))}
          {canImport && <button className="rabbit-token-import-action" type="button" disabled={importing} onClick={handleImport}><Search size={14} /><span><b>{importing ? 'Reading token…' : 'Import contract'}</b><small>{shortAddress(normalized)}</small></span></button>}
          {!candidates.length && !canImport && <p>No listed token matches. Paste an ERC-20 contract address to import it from Rabbit Testnet.</p>}
          <p>RabbitSwap Factory pool tokens are indexed automatically. Manually imported contracts are permissionless and are not endorsed by Rabbit Chain.</p>
        </div>
      )}
    </div>
  )
}

export default function RabbitSwapPanel({
  networkKey = 'testnet',
  walletState,
  walletProvider,
  onConnect,
  onSwitchNetwork,
  toast,
  variant = 'platform',
}) {
  const network = PLATFORM_NETWORKS[networkKey] || PLATFORM_NETWORKS.testnet
  const testnetBeta = networkKey === 'testnet' && network.swapLive
  const connected = Boolean(walletState?.account)
  const correctNetwork = connected && walletState?.chainId === Number(network.chainId)
  const wrongNetwork = connected && !correctNetwork
  const provider = testnetBeta && correctNetwork && walletProvider?.request ? walletProvider : null
  const { tokens: testnetTokens, importToken, pools, poolsLoading, refreshPools } = useRabbitSwapTokens(provider, testnetBeta)
  const protocolFee = useRabbitSwapProtocolFee(provider, testnetBeta)
  const { slippageBps, slippageLabel, setSlippageBps } = useRabbitSlippage()
  const tokens = testnetBeta ? testnetTokens : network.tokens

  const [fromKey, setFromKey] = useState(testnetBeta ? 'tRAB' : network.defaultFrom)
  const [toKey, setToKey] = useState(testnetBeta ? 'tRUSD' : network.defaultTo)
  const [amount, setAmount] = useState('')
  const [openSelector, setOpenSelector] = useState(null)
  const [quote, setQuote] = useState(null)
  const [minimumOut, setMinimumOut] = useState(null)
  const [path, setPath] = useState(null)
  const [spotOutput, setSpotOutput] = useState(null)
  const [balance, setBalance] = useState(null)
  const [allowance, setAllowance] = useState(0n)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [pending, setPending] = useState(null)

  useEffect(() => {
    setFromKey(testnetBeta ? 'tRAB' : network.defaultFrom)
    setToKey(testnetBeta ? 'tRUSD' : network.defaultTo)
    setAmount('')
    setOpenSelector(null)
    setQuote(null)
  }, [networkKey, network.defaultFrom, network.defaultTo, testnetBeta])

  const fromToken = tokens.find((item) => tokenKey(item) === fromKey || item.symbol === fromKey) || tokens[0] || null
  const toToken = tokens.find((item) => tokenKey(item) === toKey || item.symbol === toKey) || tokens.find((item) => canonicalSwapAddress(item)?.toLowerCase() !== canonicalSwapAddress(fromToken)?.toLowerCase()) || null

  const amountIn = useMemo(() => {
    try { return parseTokenAmount(amount, fromToken?.decimals ?? 18) } catch { return 0n }
  }, [amount, fromToken])

  const refreshAccount = useCallback(async () => {
    if (!testnetBeta || !walletState?.account || !provider || !fromToken) {
      setBalance(null)
      setAllowance(0n)
      return
    }
    const reads = await Promise.allSettled([
      readTokenBalance(fromToken, walletState.account, provider),
      fromToken.native
        ? Promise.resolve(0n)
        : readAllowance(fromToken.address, walletState.account, RABBIT_SWAP_TESTNET.router, provider),
    ])
    setBalance(reads[0].status === 'fulfilled' ? BigInt(reads[0].value) : null)
    setAllowance(reads[1].status === 'fulfilled' ? BigInt(reads[1].value) : 0n)
  }, [testnetBeta, walletState?.account, provider, fromToken])

  useEffect(() => { refreshAccount() }, [refreshAccount])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      if (!testnetBeta || !fromToken || !toToken || amountIn <= 0n) {
        setQuote(null)
        setMinimumOut(null)
        setPath(null)
        setSpotOutput(null)
        return
      }

      setLoadingQuote(true)
      try {
        const best = await quoteBestSwapRoute({
          amountIn,
          fromToken,
          toToken,
          pools,
          provider,
        })
        if (cancelled) return
        if (best) {
          setQuote(best.amountOut)
          setMinimumOut(applySlippage(best.amountOut, slippageBps))
          setPath(best.path)
          setSpotOutput(best.spotOutput)
        } else {
          setQuote(null)
          setMinimumOut(null)
          setPath(null)
          setSpotOutput(null)
        }
      } finally {
        if (!cancelled) setLoadingQuote(false)
      }
    }, 250)

    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [testnetBeta, fromToken, toToken, amountIn, pools, provider, slippageBps])

  const priceImpact = useMemo(() => {
    if (!quote || !spotOutput || spotOutput <= 0n || quote >= spotOutput) return quote && spotOutput ? 0 : null
    return Number(((spotOutput - quote) * 1_000_000n) / spotOutput) / 10_000
  }, [quote, spotOutput])

  const insufficientBalance = balance !== null && amountIn > balance
  const needsApproval = testnetBeta && !fromToken?.native && amountIn > 0n && allowance < amountIn

  let actionLabel = 'Enter an amount'
  let actionDisabled = true
  if (!connected) { actionLabel = 'Connect wallet'; actionDisabled = false }
  else if (wrongNetwork) { actionLabel = `Switch to ${network.name}`; actionDisabled = false }
  else if (!testnetBeta) actionLabel = 'Swap activates after contracts'
  else if (insufficientBalance) actionLabel = `Insufficient ${fromToken.symbol}`
  else if (amountIn > 0n && !quote && !loadingQuote) actionLabel = 'No active route'
  else if (needsApproval) { actionLabel = `Approve & swap ${fromToken.symbol}`; actionDisabled = false }
  else if (amountIn > 0n && quote) { actionLabel = `Swap ${fromToken.symbol} → ${toToken.symbol}`; actionDisabled = false }
  if (pending) { actionLabel = pending; actionDisabled = true }

  async function ensureInputApproval(plan) {
    setPending(`Step 1 of 2 — Approving ${plan.fromToken.symbol}…`)
    await approveExact({
      provider: walletProvider,
      account: walletState.account,
      tokenAddress: plan.fromToken.address,
      spender: RABBIT_SWAP_TESTNET.router,
      amount: plan.amountIn,
      currentAllowance: plan.allowance,
      abi: RABBIT_SWAP_ERC20_ABI,
      onReset: () => toast?.(`Resetting existing ${plan.fromToken.symbol} allowance first`),
    })
    toast?.(`${plan.fromToken.symbol} approved. Confirm the swap next.`)
  }

  async function executeSwapPlan(plan, followsApproval = false) {
    setPending(followsApproval ? 'Step 2 of 2 — Confirm swap…' : 'Submitting swap…')
    let functionName
    let args
    let value = 0n

    if (plan.fromToken.native) {
      functionName = 'swapExactRABForTokens'
      args = [plan.minimumOut, plan.path, walletState.account, deadlineIn()]
      value = plan.amountIn
    } else if (plan.toToken.native) {
      functionName = 'swapExactTokensForRAB'
      args = [plan.amountIn, plan.minimumOut, plan.path, walletState.account, deadlineIn()]
    } else {
      functionName = 'swapExactTokensForTokens'
      args = [plan.amountIn, plan.minimumOut, plan.path, walletState.account, deadlineIn()]
    }

    const hash = await sendRabbitContract({
      provider: walletProvider,
      account: walletState.account,
      address: RABBIT_SWAP_TESTNET.router,
      abi: RABBIT_SWAP_ROUTER_ABI,
      functionName,
      args,
      value,
    })
    toast?.('Rabbit Swap transaction submitted')
    const receipt = await waitForRabbitReceipt(hash, walletProvider)
    if (receipt?.status === '0x0') throw new Error('Rabbit Swap transaction reverted')
    toast?.(receipt ? 'Swap confirmed on Rabbit Testnet' : 'Swap submitted; confirmation is taking longer than expected')
    setAmount('')
    setQuote(null)
    await refreshAccount()
    await refreshPools()
  }

  async function handleAction() {
    if (!connected) return onConnect?.()
    if (wrongNetwork) return onSwitchNetwork?.(NETWORKS[networkKey])
    if (!quote || !minimumOut || !path || amountIn <= 0n || pending) return

    // Capture the quote and protection before opening any wallet prompt. An ERC-20
    // approval must continue directly into the swap without forcing a second click.
    const plan = {
      fromToken,
      toToken,
      amountIn,
      minimumOut,
      path: [...path],
      allowance,
    }
    const requiresApproval = Boolean(needsApproval)

    try {
      if (requiresApproval) await ensureInputApproval(plan)
      await executeSwapPlan(plan, requiresApproval)
    } catch (error) {
      toast?.(friendlyWalletError(error, requiresApproval ? 'Approve-and-swap flow failed' : 'Swap failed'))
    } finally {
      setPending(null)
    }
  }

  function switchTokens() {
    if (!fromToken || !toToken) return
    setFromKey(tokenKey(toToken))
    setToKey(tokenKey(fromToken))
    setAmount('')
    setQuote(null)
  }

  const balanceText = balance === null ? '—' : formatTokenAmount(balance, fromToken?.decimals ?? 18, 6)
  const outputText = quote === null ? '' : formatTokenAmount(quote, toToken?.decimals ?? 18, 8)
  const routeText = useMemo(() => {
    if (!path?.length || !fromToken || !toToken) return poolsLoading ? 'Scanning RabbitSwap pools…' : 'Best route'
    return path.map((address, index) => {
      if (index === 0) return fromToken.symbol
      if (index === path.length - 1) return toToken.symbol
      const match = tokens.find((token) => !token.native && canonicalSwapAddress(token)?.toLowerCase() === address.toLowerCase())
      return match?.symbol || shortAddress(address)
    }).join(' → ')
  }, [path, fromToken, toToken, tokens, poolsLoading])

  async function handleImportToken(address) {
    try {
      const imported = await importToken(address)
      toast?.(`${imported.symbol} imported from Rabbit Testnet`)
      return imported
    } catch (error) {
      toast?.(friendlyWalletError(error, 'Token import failed'))
      return null
    }
  }

  const lpFeeText = protocolFee.enabled === true ? '≈0.25%' : protocolFee.enabled === false ? '0.30%' : 'Read after connect'
  const protocolFeeText = protocolFee.enabled === true ? '≈0.05%' : protocolFee.enabled === false ? 'OFF' : 'Read after connect'

  return (
    <div className={`product-panel product-swap rabbit-swap-panel rabbit-swap-panel--${variant} ${testnetBeta ? 'rabbit-swap-live' : ''}`}>
      <div className="rabbit-swap-toolbar">
        <div><strong>Rabbit Swap</strong><small>{network.name} · Chain ID {network.chainId}</small></div>
        <span>{testnetBeta ? 'TESTNET BETA' : network.status}</span>
      </div>

      {testnetBeta && (
        <div className="rabbit-beta-strip">
          <CheckCircle2 size={15} />
          <span>Permissionless routing · live RabbitSwap Factory pools are indexed automatically.</span>
          <a href={`${NETWORKS.testnet.explorerUrl}/address/${RABBIT_SWAP_TESTNET.router}`} target="_blank" rel="noreferrer">Router <ArrowUpRight size={12} /></a>
        </div>
      )}

      <div className="rabbit-swap-field">
        <div className="rabbit-swap-field-label"><label>From</label><small>Balance {balanceText}</small></div>
        <div className="rabbit-swap-field-main">
          <TokenSelector token={fromToken} tokens={tokens} open={openSelector === 'from'} otherToken={toToken} onToggle={() => setOpenSelector(openSelector === 'from' ? null : 'from')} onImportToken={handleImportToken} onSelect={(key) => { setFromKey(key); setOpenSelector(null); setAmount(''); setQuote(null) }} />
          <div className="rabbit-swap-amount"><input inputMode="decimal" value={amount} onChange={(event) => setAmount(cleanDecimalInput(event.target.value))} placeholder="0.00" aria-label="Amount to swap" /><small>{fromToken?.native ? 'Native tRAB' : `${fromToken?.decimals} decimals`}</small></div>
        </div>
      </div>

      <div className="rabbit-swap-direction"><button type="button" onClick={switchTokens} aria-label="Switch tokens"><ArrowDown size={16} /></button></div>

      <div className="rabbit-swap-field">
        <div className="rabbit-swap-field-label"><label>To</label><small>{loadingQuote ? 'Reading quote…' : 'Estimated output'}</small></div>
        <div className="rabbit-swap-field-main">
          <TokenSelector token={toToken} tokens={tokens} open={openSelector === 'to'} otherToken={fromToken} onToggle={() => setOpenSelector(openSelector === 'to' ? null : 'to')} onImportToken={handleImportToken} onSelect={(key) => { setToKey(key); setOpenSelector(null); setQuote(null) }} />
          <div className="rabbit-swap-amount"><input value={outputText} readOnly placeholder="0.00" aria-label="Estimated received amount" /><small>{toToken?.native ? 'Native tRAB' : `${toToken?.decimals} decimals`}</small></div>
        </div>
      </div>

      {testnetBeta && quote !== null && toToken && (
        <div className="rabbit-swap-details">
          <div><span>Minimum received</span><b>{formatTokenAmount(minimumOut, toToken.decimals, 8)} {toToken.symbol}</b></div>
          <div><span>Total swap fee</span><b>0.30%</b></div>
          <div><span>LP fee share</span><b>{lpFeeText}</b></div>
          <div><span>Rabbit protocol</span><b>{protocolFeeText}</b></div>
          <div><span>Price impact incl. fee</span><b>{priceImpact === null ? '—' : `${priceImpact.toFixed(priceImpact < 0.1 ? 3 : 2)}%`}</b></div>
          <div><span>Slippage tolerance</span><b>{slippageLabel}%</b></div>
        </div>
      )}

      <div className="rabbit-swap-settings"><span>Route</span><RabbitSlippageSettings slippageBps={slippageBps} setSlippageBps={setSlippageBps} triggerText={routeText} /></div>

      <button type="button" className="rabbit-swap-action" onClick={handleAction} disabled={actionDisabled}>
        {pending ? <RefreshCw className="spin" size={16} /> : <Wallet size={16} />}{actionLabel}
      </button>

      <p className="rabbit-swap-disclaimer">
        {testnetBeta
          ? `Rabbit Swap Testnet Beta indexes live Factory pools and uses the deployed RabbitSwapRouter02 to select the best available route up to 3 hops. Total AMM fee is 0.30%. When the Factory protocol fee is enabled, approximately 0.25% remains with LPs and approximately 0.05% is captured by the protocol through LP minting. Imported tokens are permissionless and not endorsed. Testnet assets have no guaranteed monetary value.${connected ? ` Connected ${shortAddress(walletState.account)}.` : ''}`
          : 'No swap is presented as live until the official contracts, liquidity and routing are released.'}
      </p>
    </div>
  )
}
