import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUpRight, CheckCircle2, Droplets, RefreshCw, Search, Wallet, Waves } from 'lucide-react'
import { NETWORKS } from '../config/networks'
import {
  RABBIT_SWAP_ERC20_ABI,
  RABBIT_SWAP_PAIR_ABI,
  RABBIT_SWAP_ROUTER_ABI,
  RABBIT_SWAP_TESTNET,
  canonicalSwapAddress,
} from '../config/swap'
import {
  applySlippage,
  approveExact,
  cleanDecimalInput,
  deadlineIn,
  formatInputAmount,
  formatTokenAmount,
  getPairSnapshot,
  parseTokenAmount,
  readAllowance,
  readTokenBalance,
  sendRabbitContract,
  waitForRabbitReceipt,
} from '../lib/rabbitSwap'
import { friendlyWalletError, shortAddress } from '../lib/wallet'
import RabbitSlippageSettings from './RabbitSlippageSettings'
import { useRabbitSlippage } from '../hooks/useRabbitSlippage'
import { filterSwapTokens, tokenKey, useRabbitSwapProtocolFee, useRabbitSwapTokens } from '../hooks/useRabbitSwapTokens'

const TESTNET = NETWORKS.testnet

function TokenLogo({ token }) {
  if (token?.logo) return <span className="rabbit-token-logo"><img src={token.logo} alt={`${token.symbol} logo`} /></span>
  return <span className="rabbit-token-logo rabbit-token-logo-fallback">{token?.symbol?.slice(-1) || '?'}</span>
}

function LiquidityTokenSelect({ token, otherToken, tokens, onChange }) {
  const otherCanonical = canonicalSwapAddress(otherToken)?.toLowerCase()
  return (
    <label className="liquidity-token-select">
      <TokenLogo token={token} />
      <span><b>{token.symbol}</b><small>{token.name}</small></span>
      <select value={tokenKey(token)} onChange={(event) => onChange(event.target.value)}>
        {tokens.filter((item) => canonicalSwapAddress(item)?.toLowerCase() !== otherCanonical).map((item) => (
          <option key={tokenKey(item)} value={tokenKey(item)}>{item.symbol}</option>
        ))}
      </select>
    </label>
  )
}

function PairMetric({ label, value, detail }) {
  return <div className="liquidity-metric"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
}

export default function RabbitLiquidityPanel({ walletState, walletProvider, onConnect, onSwitchNetwork, toast }) {
  const account = walletState?.account || null
  const connected = Boolean(account)
  const correctNetwork = connected && walletState?.chainId === TESTNET.chainId
  const provider = correctNetwork && walletProvider?.request ? walletProvider : null
  const { tokens, importToken } = useRabbitSwapTokens(provider)
  const protocolFee = useRabbitSwapProtocolFee(provider)
  const { slippageBps, slippageLabel, setSlippageBps } = useRabbitSlippage()
  const [tokenAKey, setTokenAKey] = useState('tRAB')
  const [tokenBKey, setTokenBKey] = useState('tRUSD')
  const [tokenSearch, setTokenSearch] = useState('')
  const [tokenSearchSide, setTokenSearchSide] = useState('A')
  const [importingToken, setImportingToken] = useState(false)
  const [mode, setMode] = useState('add')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [lpAmount, setLpAmount] = useState('')
  const [snapshot, setSnapshot] = useState({ pair: null, reserveA: 0n, reserveB: 0n, totalSupply: 0n, lpBalance: 0n, lpAllowance: 0n })
  const [balances, setBalances] = useState({ A: null, B: null })
  const [allowances, setAllowances] = useState({ A: 0n, B: 0n })
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(null)

  const tokenA = tokens.find((item) => tokenKey(item) === tokenAKey || item.symbol === tokenAKey) || tokens[0]
  const tokenB = tokens.find((item) => tokenKey(item) === tokenBKey || item.symbol === tokenBKey) || tokens[2]

  const rawA = useMemo(() => { try { return parseTokenAmount(amountA, tokenA.decimals) } catch { return 0n } }, [amountA, tokenA])
  const rawB = useMemo(() => { try { return parseTokenAmount(amountB, tokenB.decimals) } catch { return 0n } }, [amountB, tokenB])
  const rawLP = useMemo(() => { try { return parseTokenAmount(lpAmount, 18) } catch { return 0n } }, [lpAmount])

  const refresh = useCallback(async () => {
    setLoading(true)
    const activeProvider = provider
    const pairPromise = getPairSnapshot(tokenA, tokenB, account, activeProvider)
    const balanceReads = account && activeProvider
      ? Promise.allSettled([
          readTokenBalance(tokenA, account, activeProvider),
          readTokenBalance(tokenB, account, activeProvider),
          tokenA.native ? Promise.resolve(0n) : readAllowance(tokenA.address, account, RABBIT_SWAP_TESTNET.router, activeProvider),
          tokenB.native ? Promise.resolve(0n) : readAllowance(tokenB.address, account, RABBIT_SWAP_TESTNET.router, activeProvider),
        ])
      : Promise.resolve([])

    const [pair, reads] = await Promise.all([pairPromise, balanceReads])
    setSnapshot(pair)
    if (reads.length) {
      setBalances({
        A: reads[0].status === 'fulfilled' ? BigInt(reads[0].value) : null,
        B: reads[1].status === 'fulfilled' ? BigInt(reads[1].value) : null,
      })
      setAllowances({
        A: reads[2].status === 'fulfilled' ? BigInt(reads[2].value) : 0n,
        B: reads[3].status === 'fulfilled' ? BigInt(reads[3].value) : 0n,
      })
    } else {
      setBalances({ A: null, B: null })
      setAllowances({ A: 0n, B: 0n })
    }
    setLoading(false)
  }, [tokenA, tokenB, account, provider])

  useEffect(() => { refresh() }, [refresh])

  function changeToken(side, key) {
    if (side === 'A') setTokenAKey(key)
    else setTokenBKey(key)
    setAmountA('')
    setAmountB('')
    setLpAmount('')
  }

  const searchOtherToken = tokenSearchSide === 'A' ? tokenB : tokenA
  const tokenSearchMatches = useMemo(
    () => filterSwapTokens(tokens, tokenSearch, searchOtherToken).slice(0, 5),
    [tokens, tokenSearch, searchOtherToken],
  )

  function selectLiquidityToken(token, side = tokenSearchSide) {
    if (!token) return false
    const other = side === 'A' ? tokenB : tokenA
    const selectedAddress = canonicalSwapAddress(token)?.toLowerCase()
    const otherAddress = canonicalSwapAddress(other)?.toLowerCase()
    if (selectedAddress && selectedAddress === otherAddress) {
      toast?.('Choose two different assets for a liquidity pair')
      return false
    }
    changeToken(side, tokenKey(token))
    setTokenSearch('')
    toast?.(`${token.symbol} selected as Token ${side}`)
    return true
  }

  async function importSearchToken() {
    const query = tokenSearch.trim()
    if (!query) return

    const exact = tokens.find((token) => token.symbol?.toLowerCase() === query.toLowerCase()
      || token.name?.toLowerCase() === query.toLowerCase()
      || token.address?.toLowerCase() === query.toLowerCase())
    if (exact) {
      selectLiquidityToken(exact)
      return
    }

    // Unknown symbols cannot be discovered globally on an EVM chain without an
    // indexer/registry. For external tokens, require the contract address and
    // read metadata directly from Rabbit Testnet.
    if (!/^0x[0-9a-fA-F]{40}$/.test(query)) {
      toast?.('External token not indexed yet — paste its ERC-20 contract address')
      return
    }

    try {
      setImportingToken(true)
      const imported = await importToken(query)
      if (selectLiquidityToken(imported)) toast?.(`${imported.symbol} imported from Rabbit Testnet`)
    } catch (error) {
      toast?.(friendlyWalletError(error, 'Token search failed'))
    } finally {
      setImportingToken(false)
    }
  }

  function updateAddAmount(side, input) {
    const value = cleanDecimalInput(input)
    if (side === 'A') setAmountA(value)
    else setAmountB(value)

    if (!snapshot.pair || snapshot.reserveA <= 0n || snapshot.reserveB <= 0n) return
    try {
      if (side === 'A') {
        const raw = parseTokenAmount(value, tokenA.decimals)
        const matched = raw > 0n ? (raw * snapshot.reserveB) / snapshot.reserveA : 0n
        setAmountB(formatInputAmount(matched, tokenB.decimals, 10))
      } else {
        const raw = parseTokenAmount(value, tokenB.decimals)
        const matched = raw > 0n ? (raw * snapshot.reserveA) / snapshot.reserveB : 0n
        setAmountA(formatInputAmount(matched, tokenA.decimals, 10))
      }
    } catch {}
  }

  const needsApprovalA = !tokenA.native && rawA > 0n && allowances.A < rawA
  const needsApprovalB = !tokenB.native && rawB > 0n && allowances.B < rawB
  const insufficientA = balances.A !== null && rawA > balances.A
  const insufficientB = balances.B !== null && rawB > balances.B
  const canAdd = rawA > 0n && rawB > 0n && !insufficientA && !insufficientB

  const removalEstimate = useMemo(() => {
    if (!snapshot.pair || rawLP <= 0n || snapshot.totalSupply <= 0n) return null
    return {
      A: (rawLP * snapshot.reserveA) / snapshot.totalSupply,
      B: (rawLP * snapshot.reserveB) / snapshot.totalSupply,
    }
  }, [snapshot, rawLP])

  const lpInsufficient = rawLP > snapshot.lpBalance
  const lpNeedsApproval = snapshot.pair && rawLP > 0n && snapshot.lpAllowance < rawLP

  async function ensureTokenApproval({ token, amount, currentAllowance, step, totalSteps }) {
    setPending(`Step ${step} of ${totalSteps} — Approving ${token.symbol}…`)
    await approveExact({
      provider: walletProvider,
      account,
      tokenAddress: token.address,
      spender: RABBIT_SWAP_TESTNET.router,
      amount,
      currentAllowance,
      abi: RABBIT_SWAP_ERC20_ABI,
      onReset: () => toast?.(`Resetting existing ${token.symbol} allowance first`),
    })
    toast?.(`${token.symbol} approved for liquidity`)
  }

  async function executeAddLiquidity(plan, approvalCount = 0) {
    const totalSteps = approvalCount + 1
    setPending(approvalCount ? `Step ${totalSteps} of ${totalSteps} — Confirm add liquidity…` : 'Adding liquidity…')
    const minA = applySlippage(plan.rawA, plan.slippageBps)
    const minB = applySlippage(plan.rawB, plan.slippageBps)
    let functionName
    let args
    let value = 0n

    if (plan.tokenA.native || plan.tokenB.native) {
      const nativeIsA = plan.tokenA.native
      const erc = nativeIsA ? plan.tokenB : plan.tokenA
      const rawToken = nativeIsA ? plan.rawB : plan.rawA
      const rawNative = nativeIsA ? plan.rawA : plan.rawB
      const minToken = nativeIsA ? minB : minA
      const minNative = nativeIsA ? minA : minB
      functionName = 'addLiquidityRAB'
      args = [erc.address, rawToken, minToken, minNative, account, deadlineIn()]
      value = rawNative
    } else {
      functionName = 'addLiquidity'
      args = [plan.tokenA.address, plan.tokenB.address, plan.rawA, plan.rawB, minA, minB, account, deadlineIn()]
    }

    const hash = await sendRabbitContract({
      provider: walletProvider,
      account,
      address: RABBIT_SWAP_TESTNET.router,
      abi: RABBIT_SWAP_ROUTER_ABI,
      functionName,
      args,
      value,
    })
    toast?.('Liquidity transaction submitted')
    const receipt = await waitForRabbitReceipt(hash, walletProvider)
    if (receipt?.status === '0x0') throw new Error('Liquidity transaction reverted')
    toast?.(receipt ? 'Liquidity added on Rabbit Testnet' : 'Liquidity submitted; confirmation is taking longer than expected')
    setAmountA('')
    setAmountB('')
    await refresh()
  }

  async function addAction() {
    if (!connected) return onConnect?.()
    if (!correctNetwork) return onSwitchNetwork?.(TESTNET)
    if (!canAdd || pending) return

    // Freeze the pair and amounts before the first wallet prompt. Any required
    // ERC-20 approvals continue automatically into addLiquidity in this click.
    const plan = {
      tokenA,
      tokenB,
      rawA,
      rawB,
      allowanceA: allowances.A,
      allowanceB: allowances.B,
      slippageBps,
    }
    const approvals = []
    if (!plan.tokenA.native && plan.allowanceA < plan.rawA) approvals.push({ token: plan.tokenA, amount: plan.rawA, currentAllowance: plan.allowanceA })
    if (!plan.tokenB.native && plan.allowanceB < plan.rawB) approvals.push({ token: plan.tokenB, amount: plan.rawB, currentAllowance: plan.allowanceB })
    const totalSteps = approvals.length + 1

    try {
      for (let index = 0; index < approvals.length; index += 1) {
        await ensureTokenApproval({ ...approvals[index], step: index + 1, totalSteps })
      }
      await executeAddLiquidity(plan, approvals.length)
    } catch (error) {
      toast?.(friendlyWalletError(error, approvals.length ? 'Approve-and-add-liquidity flow failed' : 'Add liquidity failed'))
    } finally {
      setPending(null)
    }
  }

  async function approveLPForRemoval(pair, amount) {
    setPending('Step 1 of 2 — Approving RABBIT-LP…')
    const hash = await sendRabbitContract({
      provider: walletProvider,
      account,
      address: pair,
      abi: RABBIT_SWAP_PAIR_ABI,
      functionName: 'approve',
      args: [RABBIT_SWAP_TESTNET.router, amount],
    })
    const receipt = await waitForRabbitReceipt(hash, walletProvider)
    if (receipt?.status === '0x0') throw new Error('RABBIT-LP approval reverted')
    if (!receipt) throw new Error('RABBIT-LP approval confirmation timed out')
    toast?.('RABBIT-LP approved. Confirm the removal transaction next.')
  }

  async function executeRemoveLiquidity(plan, followsApproval = false) {
    setPending(followsApproval ? 'Step 2 of 2 — Confirm removal…' : 'Removing liquidity…')
    const minA = applySlippage(plan.estimate.A, plan.slippageBps)
    const minB = applySlippage(plan.estimate.B, plan.slippageBps)
    let functionName
    let args

    if (plan.tokenA.native || plan.tokenB.native) {
      const nativeIsA = plan.tokenA.native
      const erc = nativeIsA ? plan.tokenB : plan.tokenA
      const minToken = nativeIsA ? minB : minA
      const minNative = nativeIsA ? minA : minB
      functionName = 'removeLiquidityRAB'
      args = [erc.address, plan.amount, minToken, minNative, account, deadlineIn()]
    } else {
      functionName = 'removeLiquidity'
      args = [plan.tokenA.address, plan.tokenB.address, plan.amount, minA, minB, account, deadlineIn()]
    }

    const hash = await sendRabbitContract({ provider: walletProvider, account, address: RABBIT_SWAP_TESTNET.router, abi: RABBIT_SWAP_ROUTER_ABI, functionName, args })
    toast?.('Remove-liquidity transaction submitted')
    const receipt = await waitForRabbitReceipt(hash, walletProvider)
    if (receipt?.status === '0x0') throw new Error('Remove-liquidity transaction reverted')
    toast?.(receipt ? 'Liquidity removed on Rabbit Testnet' : 'Removal submitted; confirmation is taking longer than expected')
    setLpAmount('')
    await refresh()
  }

  async function removeAction() {
    if (!connected) return onConnect?.()
    if (!correctNetwork) return onSwitchNetwork?.(TESTNET)
    if (rawLP <= 0n || lpInsufficient || !removalEstimate || pending) return

    // Capture the requested position before any wallet prompt. The approval receipt
    // must not clear or recalculate the removal amount before step 2 is submitted.
    const plan = {
      pair: snapshot.pair,
      amount: rawLP,
      estimate: { A: removalEstimate.A, B: removalEstimate.B },
      tokenA,
      tokenB,
      slippageBps,
    }
    const requiresApproval = Boolean(lpNeedsApproval)

    try {
      if (requiresApproval) await approveLPForRemoval(plan.pair, plan.amount)
      await executeRemoveLiquidity(plan, requiresApproval)
    } catch (error) {
      toast?.(friendlyWalletError(error, requiresApproval ? 'Liquidity removal flow failed' : 'Remove liquidity failed'))
    } finally {
      setPending(null)
    }
  }

  let addLabel = 'Enter both amounts'
  let addDisabled = true
  if (!connected) { addLabel = 'Connect wallet'; addDisabled = false }
  else if (!correctNetwork) { addLabel = 'Switch to Rabbit Testnet'; addDisabled = false }
  else if (insufficientA) addLabel = `Insufficient ${tokenA.symbol}`
  else if (insufficientB) addLabel = `Insufficient ${tokenB.symbol}`
  else if (needsApprovalA && needsApprovalB) { addLabel = 'Approve tokens & add liquidity'; addDisabled = false }
  else if (needsApprovalA) { addLabel = `Approve ${tokenA.symbol} & add liquidity`; addDisabled = false }
  else if (needsApprovalB) { addLabel = `Approve ${tokenB.symbol} & add liquidity`; addDisabled = false }
  else if (canAdd) { addLabel = snapshot.pair ? 'Add liquidity' : 'Create pair & add liquidity'; addDisabled = false }
  if (pending) { addLabel = pending; addDisabled = true }

  let removeLabel = 'Enter LP amount'
  let removeDisabled = true
  if (!connected) { removeLabel = 'Connect wallet'; removeDisabled = false }
  else if (!correctNetwork) { removeLabel = 'Switch to Rabbit Testnet'; removeDisabled = false }
  else if (!snapshot.pair) removeLabel = 'No pair exists yet'
  else if (lpInsufficient) removeLabel = 'Insufficient RABBIT-LP'
  else if (lpNeedsApproval) { removeLabel = 'Approve & remove liquidity'; removeDisabled = false }
  else if (rawLP > 0n) { removeLabel = 'Remove liquidity'; removeDisabled = false }
  if (pending) { removeLabel = pending; removeDisabled = true }

  const reserveAText = snapshot.readUnavailable ? '—' : formatTokenAmount(snapshot.reserveA, tokenA.decimals, 8)
  const reserveBText = snapshot.readUnavailable ? '—' : formatTokenAmount(snapshot.reserveB, tokenB.decimals, 8)
  const lpText = formatTokenAmount(snapshot.lpBalance, 18, 12)
  const poolShare = snapshot.totalSupply > 0n && snapshot.lpBalance > 0n
    ? Number((snapshot.lpBalance * 1_000_000n) / snapshot.totalSupply) / 10_000
    : 0
  const lpFeeText = protocolFee.enabled === true ? '≈0.25% of volume' : protocolFee.enabled === false ? '0.30% of volume' : 'Read after connect'
  const protocolFeeText = protocolFee.enabled === true ? `≈0.05% · ${shortAddress(protocolFee.feeTo)}` : protocolFee.enabled === false ? 'OFF' : 'Read after connect'

  return (
    <div className="product-panel rabbit-liquidity-panel">
      <div className="product-panel-title">
        <div><Waves size={20} /><span>LIQUIDITY</span></div>
        <b className="faucet-live-badge">TESTNET BETA</b>
      </div>

      <div className="liquidity-intro">
        <div><h3>Rabbit Swap Liquidity</h3><p>Create and manage permissionless RabbitSwap pairs. Use verified Testnet assets, future Token Factory assets, or import any compatible Rabbit Testnet ERC-20 by contract address.</p></div>
        <button onClick={refresh} disabled={loading}><RefreshCw className={loading ? 'spin' : ''} size={15} /> Refresh</button>
      </div>

      <div className="rabbit-beta-strip liquidity-beta-strip">
        <CheckCircle2 size={15} />
        <span>Reference pool active · tWRAB / tRUSD</span>
        <a href={`${TESTNET.explorerUrl}/address/${RABBIT_SWAP_TESTNET.referencePair}`} target="_blank" rel="noreferrer">Pair <ArrowUpRight size={12} /></a>
      </div>

      <div className="liquidity-mode-tabs">
        <button className={mode === 'add' ? 'active' : ''} onClick={() => setMode('add')}>Add liquidity</button>
        <button className={mode === 'remove' ? 'active' : ''} onClick={() => setMode('remove')}>Remove liquidity</button>
      </div>

      <div className="liquidity-pair-selectors">
        <LiquidityTokenSelect token={tokenA} otherToken={tokenB} tokens={tokens} onChange={(key) => changeToken('A', key)} />
        <span><ArrowDown size={15} /></span>
        <LiquidityTokenSelect token={tokenB} otherToken={tokenA} tokens={tokens} onChange={(key) => changeToken('B', key)} />
      </div>

      <div className="liquidity-token-finder">
        <div className="liquidity-token-search-target" aria-label="Choose which side receives the searched token">
          <span>ADD TO</span>
          <button type="button" className={tokenSearchSide === 'A' ? 'active' : ''} onClick={() => setTokenSearchSide('A')}>Token A · {tokenA.symbol}</button>
          <button type="button" className={tokenSearchSide === 'B' ? 'active' : ''} onClick={() => setTokenSearchSide('B')}>Token B · {tokenB.symbol}</button>
        </div>
        <div className="liquidity-token-search">
          <Search size={14} />
          <input value={tokenSearch} onChange={(event) => setTokenSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') importSearchToken() }} placeholder="Search known token or paste ERC-20 contract address" />
          <button type="button" onClick={importSearchToken} disabled={importingToken}>{importingToken ? 'Reading…' : 'Find / import'}</button>
        </div>
        {tokenSearch.trim() && tokenSearchMatches.length > 0 && (
          <div className="liquidity-token-results">
            {tokenSearchMatches.map((item) => (
              <button type="button" key={tokenKey(item)} onClick={() => selectLiquidityToken(item)}>
                <TokenLogo token={item} />
                <span><b>{item.symbol}</b><small>{item.name}{item.imported ? ' · imported ERC-20' : ''}</small></span>
                <em>Use as {tokenSearchSide}</em>
              </button>
            ))}
          </div>
        )}
        <p className="liquidity-token-finder-note">External token? Paste its Rabbit Testnet ERC-20 contract address. Imported tokens are saved locally and become available in both Liquidity and Swap. If the selected pair does not exist, RabbitSwap creates it automatically with the first liquidity deposit.</p>
      </div>

      <div className="rabbit-fee-policy">
        <span><b>Swap fee</b> 0.30%</span>
        <span><b>LP fee</b> {lpFeeText}</span>
        <span><b>Rabbit protocol</b> {protocolFeeText}</span>
        <span><b>Create pair</b> gas only</span>
      </div>

      <div className="liquidity-transaction-settings">
        <span>Transaction protection</span>
        <RabbitSlippageSettings slippageBps={slippageBps} setSlippageBps={setSlippageBps} triggerText={`Slippage ${slippageLabel}%`} />
      </div>

      <div className="liquidity-metrics-grid">
        <PairMetric label="PAIR" value={snapshot.pair ? 'ACTIVE' : 'NEW PAIR'} detail={snapshot.pair ? shortAddress(snapshot.pair) : 'Created automatically on first liquidity'} />
        <PairMetric label={`${tokenA.symbol} RESERVE`} value={`${reserveAText} ${tokenA.symbol}`} />
        <PairMetric label={`${tokenB.symbol} RESERVE`} value={`${reserveBText} ${tokenB.symbol}`} />
        <PairMetric label="YOUR RABBIT-LP" value={connected ? `${lpText} LP` : 'Connect wallet'} detail={connected && snapshot.pair ? `Pool share ${poolShare.toFixed(poolShare < 0.01 ? 4 : 2)}%` : null} />
      </div>

      {mode === 'add' ? (
        <div className="liquidity-form">
          <div className="liquidity-amount-row"><div><span>{tokenA.symbol}</span><small>Balance {balances.A === null ? '—' : formatTokenAmount(balances.A, tokenA.decimals, 8)}</small></div><input inputMode="decimal" value={amountA} onChange={(event) => updateAddAmount('A', event.target.value)} placeholder="0.00" /></div>
          <div className="liquidity-plus"><Droplets size={15} /></div>
          <div className="liquidity-amount-row"><div><span>{tokenB.symbol}</span><small>Balance {balances.B === null ? '—' : formatTokenAmount(balances.B, tokenB.decimals, 8)}</small></div><input inputMode="decimal" value={amountB} onChange={(event) => updateAddAmount('B', event.target.value)} placeholder="0.00" /></div>

          {snapshot.pair && snapshot.reserveA > 0n && snapshot.reserveB > 0n && <p className="liquidity-ratio-note">Existing pool ratio is applied automatically when you edit either amount. Router slippage protection: {slippageLabel}%.</p>}

          <button className="rabbit-swap-action" disabled={addDisabled} onClick={addAction}>{pending ? <RefreshCw className="spin" size={16} /> : <Droplets size={16} />}{addLabel}</button>
        </div>
      ) : (
        <div className="liquidity-form">
          <div className="liquidity-remove-balance"><span>Your liquidity</span><strong>{lpText} RABBIT-LP</strong><div>{[25, 50, 100].map((pct) => <button key={pct} disabled={!snapshot.lpBalance} onClick={() => setLpAmount(formatInputAmount((snapshot.lpBalance * BigInt(pct)) / 100n, 18, 18))}>{pct}%</button>)}</div></div>
          <div className="liquidity-amount-row"><div><span>RABBIT-LP</span><small>18 decimals</small></div><input inputMode="decimal" value={lpAmount} onChange={(event) => setLpAmount(cleanDecimalInput(event.target.value))} placeholder="0.00" /></div>
          {removalEstimate && <div className="liquidity-remove-preview"><span>You receive approximately</span><b>{formatTokenAmount(removalEstimate.A, tokenA.decimals, 8)} {tokenA.symbol}</b><b>{formatTokenAmount(removalEstimate.B, tokenB.decimals, 8)} {tokenB.symbol}</b><small>Minimums use {slippageLabel}% slippage protection.</small></div>}
          <button className="rabbit-swap-action" disabled={removeDisabled} onClick={removeAction}>{pending ? <RefreshCw className="spin" size={16} /> : <Waves size={16} />}{removeLabel}</button>
        </div>
      )}

      <div className="liquidity-contracts">
        <span>FACTORY <a href={`${TESTNET.explorerUrl}/address/${RABBIT_SWAP_TESTNET.factory}`} target="_blank" rel="noreferrer">{shortAddress(RABBIT_SWAP_TESTNET.factory)} <ArrowUpRight size={11} /></a></span>
        <span>ROUTER <a href={`${TESTNET.explorerUrl}/address/${RABBIT_SWAP_TESTNET.router}`} target="_blank" rel="noreferrer">{shortAddress(RABBIT_SWAP_TESTNET.router)} <ArrowUpRight size={11} /></a></span>
      </div>

      <p className="product-disclaimer">Rabbit Swap is permissionless at the contract level: any compatible ERC-20/ERC-20 pair can be created with no protocol pair-creation fee beyond network gas. LPs earn the pool's trading fees pro-rata; fees accrue in pool reserves and are realized through LP value/liquidity removal. Paste a token contract address to use an external Rabbit Testnet ERC-20 on either side of a pair. Imported tokens are stored locally and are not endorsed. Token Factory assets will be indexed automatically when that module is activated. Testnet assets and liquidity have no guaranteed monetary value.</p>
    </div>
  )
}
