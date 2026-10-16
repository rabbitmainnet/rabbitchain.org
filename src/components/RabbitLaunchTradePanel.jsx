import { useEffect, useMemo, useState } from 'react'
import {
  createPublicClient, createWalletClient, custom, http,
  formatUnits, parseUnits, zeroAddress
} from 'viem'
import {
  RABBIT_LAUNCHPOOL_TESTNET as LEGACY_CFG,
  RABBIT_LAUNCHPOOL_ABI as LEGACY_ABI
} from '../config/launchpool'
import { RABBIT_LAUNCHPOOL_V3 as V3_CFG, RABBIT_LAUNCHPOOL_V3_ABI as V3_ABI } from '../config/launchpool-v3'

const WAD = 10n ** 18n
const SCALE = 10n ** 12n
const BPS = 10000n
const FEE = 100n

const ERC20 = [
  {
    type: 'function', name: 'allowance',
    stateMutability: 'view',
    inputs: [{ type: 'address' }, { type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function', name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [{ type: 'bool' }]
  },
  {
    type: 'function', name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }]
  }
]

const rpc = createPublicClient({
  transport: http(LEGACY_CFG.rpc, { timeout: 20000 })
})

function ceilDiv(a, b) {
  return (a + b - 1n) / b
}

function cumulative(sold, price, slope) {
  const base = price * sold / WAD
  const curve = slope * sold * sold / (2n * WAD * WAD)
  return base + curve
}

function calculate(fields, decimals, amountText, side, slippage, recovering) {
  if (side === 'buy' && recovering)
    throw Error('Buying is disabled during graduation recovery')
  if (!/^\d+(\.\d+)?$/.test(amountText.trim())) {
    throw Error('Enter a valid token amount')
  }

  const amount = parseUnits(amountText, decimals)
  if (amount <= 0n) throw Error('Amount must be greater than zero')

  const sold = BigInt(fields.sold)
  const inventory = BigInt(fields.inventory)
  const price = BigInt(fields.basePrice)
  const slope = BigInt(fields.slope)
  const scale = 10n ** BigInt(18 - decimals)
  const normalizedSold = sold * scale
  const normalizedAmount = amount * scale
  const trusd = fields.paymentAsset.toLowerCase() !== zeroAddress
  const paymentDecimals = trusd ? 6 : 18

  if (price <= 0n || price > 10n ** 24n || slope > WAD)
    throw Error('Invalid on-chain curve parameters')

  let gross18

  if (side === 'buy') {
    if (amount > inventory) throw Error('Amount exceeds available inventory')
    gross18 = cumulative(normalizedSold + normalizedAmount, price, slope)
      - cumulative(normalizedSold, price, slope)
  } else {
    if (amount > sold) throw Error('Amount exceeds the tokens sold by this market')
    gross18 = cumulative(normalizedSold, price, slope)
      - cumulative(normalizedSold - normalizedAmount, price, slope)
  }

  if (gross18 <= 0n) throw Error('Amount is too small for the curve')

  let gross
  if (trusd) {
    gross = side === 'buy'
      ? ceilDiv(gross18, SCALE)
      : gross18 / SCALE
  } else {
    gross = gross18
  }

  if (gross <= 0n) throw Error('Payment amount too small')

  const fee = side === 'sell' && recovering
    ? 0n
    : ceilDiv(gross * FEE, BPS)

  if (side === 'sell' && fee >= gross) {
    throw Error('Amount is too small after fees')
  }

  const payable = side === 'buy' ? gross + fee : gross - fee
  const slip = BigInt(slippage)

  const limit = side === 'buy'
    ? ceilDiv(payable * (BPS + slip), BPS)
    : payable * (BPS - slip) / BPS

  return {
    amount, payable, fee, limit,
    paymentDecimals, trusd
  }
}

export default function RabbitLaunchTradePanel({
  item,
  walletState,
  walletProvider,
  onRefresh
}) {
  const CFG = item.version === 3 ? V3_CFG : LEGACY_CFG
  const ABI = item.version === 3 ? V3_ABI : LEGACY_ABI
  const marketAddress = item.marketAddress || CFG.market
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState('100')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [recoveryMode, setRecoveryMode] = useState(null)
  const [walletBalance, setWalletBalance] = useState(null)
  const [balanceError, setBalanceError] = useState('')

  useEffect(() => {
    let cancelled = false
    setRecoveryMode(null)
    rpc.readContract({
      address: marketAddress,
      abi: ABI.market,
      functionName: 'graduationRecoveryMode',
      args: [BigInt(item.id)]
    }).then(value => {
      if (!cancelled) setRecoveryMode(Boolean(value))
    }).catch(() => {
      if (!cancelled) setRecoveryMode(null)
    })
    return () => { cancelled = true }
  }, [item.id, item.version, marketAddress])

  const fields = item.fields || {}
  const account = walletState?.account
  const correctChain = Number(walletState?.chainId) === 9280
  const decimals = item.decimals || 18
  const symbol = item.symbol || 'TOKEN'
  const asset = fields.paymentAsset?.toLowerCase() === zeroAddress
    ? 'tRAB' : 'tRUSD'

  useEffect(() => {
    let cancelled = false
    setWalletBalance(null)
    setBalanceError('')
    if (!account || !correctChain || !fields.token) return
    const fetchBalance = fields.paymentAsset?.toLowerCase() === zeroAddress
      ? rpc.getBalance({ address: account })
      : rpc.readContract({ address: CFG.tRUSD, abi: ERC20,
          functionName: 'balanceOf', args: [account] })
    const requested = side === 'sell'
      ? rpc.readContract({ address: fields.token, abi: ERC20,
          functionName: 'balanceOf', args: [account] })
      : fetchBalance
    requested.then(value => {
      if (!cancelled) setWalletBalance(value)
    }).catch(() => {
      if (!cancelled) setBalanceError('Balance unavailable. Check your wallet.')
    })
    return () => { cancelled = true }
  }, [account, correctChain, side, fields.token, fields.paymentAsset, CFG.tRUSD, item.key])

  const balanceDecimals = side === 'sell' ? decimals : asset === 'tRUSD' ? 6 : 18
  const balanceSymbol = side === 'sell' ? symbol : asset
  const balanceText = walletBalance === null ? '—' :
    Number(formatUnits(walletBalance, balanceDecimals)).toLocaleString('en-US', {
      maximumFractionDigits: 6
    })

  function setQuickAmount(value) {
    setAmount(value)
    setMessage('')
  }

  function setMaxAmount() {
    if (walletBalance === null) return
    if (side === 'sell') {
      setQuickAmount(formatUnits(walletBalance, decimals))
      return
    }
    // Price is denominated in the payment asset, but the curve API buys TOKEN units.
    // A safe upper bound for token units is found using the same on-chain curve.
    const reserve = asset === 'tRAB' ? 10n ** 15n : 0n
    const budget = walletBalance > reserve ? walletBalance - reserve : 0n
    let low = 0n
    let high = BigInt(fields.inventory || 0)
    while (low < high) {
      const mid = (low + high + 1n) / 2n
      try {
        const q = calculate(fields, decimals, formatUnits(mid, decimals),
          'buy', slippage, Boolean(recoveryMode))
        if (q.limit <= budget) low = mid
        else high = mid - 1n
      } catch { high = mid - 1n }
    }
    setQuickAmount(low > 0n ? formatUnits(low, decimals) : '')
  }

  const quotation = useMemo(() => {
    try {
      if (!amount) return { result: null, error: '' }
      if (recoveryMode === null)
        return { result: null, error: 'Checking recovery status...' }
      return {
        result: calculate(fields, decimals, amount, side, slippage, recoveryMode),
        error: ''
      }
    } catch (error) {
      return { result: null, error: error.message }
    }
  }, [fields, decimals, amount, side, slippage, recoveryMode])

  async function submit() {
    if (pending) return
    setMessage('')
    setPending(true)

    try {
      if (!account || !correctChain || !walletProvider?.request) {
        throw Error('Connect a wallet on Rabbit Testnet (9280)')
      }
      if (!fields.active || item.graduated) {
        throw Error('This market is not available for trading')
      }
      if (!quotation.result) throw Error('Enter a valid amount')

      const q = quotation.result

      // Never trust a previously selected wallet network.
      const walletChain = await walletProvider.request({
        method: 'eth_chainId'
      })
      if (BigInt(walletChain) !== BigInt(CFG.chainId))
        throw Error('Switch your wallet to Rabbit Testnet (9280)')

      // Confirm that the quote still respects the latest on-chain market.
      const updated = await rpc.readContract({
        address: marketAddress,
        abi: ABI.market,
        functionName: 'markets',
        args: [BigInt(item.id)]
      })

      const getter = ABI.market.find(
        x => x.type === 'function' && x.name === 'markets'
      )

      const fresh = Object.fromEntries(
        getter.outputs.map((field, index) => [
          field.name, updated[index]
        ])
      )

      if (fresh.token.toLowerCase() !== fields.token.toLowerCase() ||
          fresh.paymentAsset.toLowerCase() !== fields.paymentAsset.toLowerCase()) {
        throw Error('Market changed. Refresh before trading.')
      }
      if (!fresh.active) throw Error('Market is no longer active')

      const alreadyGraduated = await rpc.readContract({
        address: marketAddress,
        abi: ABI.market,
        functionName: 'graduated',
        args: [BigInt(item.id)]
      })
      if (alreadyGraduated)
        throw Error('This market has already graduated to RabbitSwap')

      const liveRecovery = await rpc.readContract({
        address: marketAddress,
        abi: ABI.market,
        functionName: 'graduationRecoveryMode',
        args: [BigInt(item.id)]
      })

      if (Boolean(liveRecovery) !== recoveryMode)
        throw Error('Recovery state changed. Refresh your quote.')

      const freshQuote = calculate(
        fresh, decimals, amount, side, slippage, Boolean(liveRecovery)
      )

      if (side === 'buy' && freshQuote.payable > q.limit) {
        throw Error('Price increased beyond your slippage limit')
      }
      if (side === 'sell' && freshQuote.payable < q.limit) {
        throw Error('Price decreased beyond your slippage limit')
      }

      const wallet = createWalletClient({
        transport: custom(walletProvider)
      })

      async function send(address, abi, functionName, args, value) {
        const currentChain = await walletProvider.request({
          method: 'eth_chainId'
        })
        if (BigInt(currentChain) !== BigInt(CFG.chainId))
          throw Error('Wrong network: Rabbit Testnet 9280 required')

        const params = {
          account,
          address,
          abi,
          functionName,
          args,
          chain: null,
          ...(value !== undefined ? { value } : {})
        }

        // Simulate against the real RPC before requesting a signature.
        await rpc.simulateContract(params)

        const hash = await wallet.writeContract(params)
        setMessage(`Transaction sent: ${hash}`)

        const receipt = await rpc.waitForTransactionReceipt({ hash })
        if (receipt.status !== 'success')
          throw Error(`Transaction reverted: ${hash}`)
      }

      async function approveIfNeeded(token, spender, required) {
        const allowed = await rpc.readContract({
          address: token,
          abi: ERC20,
          functionName: 'allowance',
          args: [account, spender]
        })

        if (allowed < required) {
          setMessage('Approve the required amount in your wallet')
          await send(token, ERC20, 'approve', [spender, required])
        }
      }

      // ERC-20 approval may take time. Recheck the market afterwards.
      if (side === 'buy' && q.trusd) {
        await approveIfNeeded(CFG.tRUSD, marketAddress, q.limit)
      }
      if (side === 'sell') {
        await approveIfNeeded(fields.token, marketAddress, q.amount)
      }

      const latestMarket = await rpc.readContract({
        address: marketAddress,
        abi: ABI.market,
        functionName: 'markets',
        args: [BigInt(item.id)]
      })
      const latestFields = Object.fromEntries(
        getter.outputs.map((field, index) => [
          field.name, latestMarket[index]
        ])
      )

      const [latestRecovery, latestGraduated] = await Promise.all([
        rpc.readContract({
          address: marketAddress,
          abi: ABI.market,
          functionName: 'graduationRecoveryMode',
          args: [BigInt(item.id)]
        }),
        rpc.readContract({
          address: marketAddress,
          abi: ABI.market,
          functionName: 'graduated',
          args: [BigInt(item.id)]
        })
      ])

      if (!latestFields.active || latestGraduated)
        throw Error('Market is no longer available')

      if (latestFields.token.toLowerCase() !== fields.token.toLowerCase() ||
          latestFields.paymentAsset.toLowerCase() !== fields.paymentAsset.toLowerCase())
        throw Error('Market identity changed')

      if (Boolean(latestRecovery) !== recoveryMode)
        throw Error('Recovery status changed. Refresh your quote.')

      const finalQuote = calculate(
        latestFields, decimals, amount, side, slippage,
        Boolean(latestRecovery)
      )

      if (side === 'buy' && finalQuote.payable > q.limit)
        throw Error('Price exceeds maximum payment')

      if (side === 'sell' && finalQuote.payable < q.limit)
        throw Error('Price is below minimum received')

      if (side === 'buy') {
        if (q.trusd) {
          await send(
            marketAddress, ABI.market, 'buyToken',
            [BigInt(item.id), q.amount, q.limit]
          )
        } else {
          // Solidity buyNative requires msg.value == exact total.
          await send(
            marketAddress, ABI.market, 'buyNative',
            [BigInt(item.id), q.amount, q.limit],
            finalQuote.payable
          )
        }
      } else {
        await send(
          marketAddress, ABI.market,
          q.trusd ? 'sellToken' : 'sellNative',
          [BigInt(item.id), q.amount, q.limit]
        )
      }

      setAmount('')
      setWalletBalance(null)
      setMessage(
        side === 'buy'
          ? 'Purchase confirmed! You can now add the token to your wallet.'
          : 'Sale confirmed on Rabbit Testnet.'
      )
      await onRefresh?.()
    } catch (error) {
      setMessage(error.shortMessage || error.message)
    } finally {
      setPending(false)
    }
  }

  // Read the graduation target directly from the corresponding V3 market.
  const [graduationTarget, setGraduationTarget] = useState(null)

  useEffect(() => {
    let active = true
    setGraduationTarget(null)
    if (item.version !== 3) return undefined

    rpc.readContract({
      address: item.marketAddress || V3_CFG.market,
      abi: V3_ABI.market,
      functionName: 'graduationTargetSold',
      args: [BigInt(item.id)]
    }).then(value => {
      if (active) setGraduationTarget(value)
    }).catch(() => {
      if (active) setGraduationTarget(null)
    })

    return () => { active = false }
  }, [item.version, item.id, item.marketAddress, fields?.sold])

  const remainingTokens = graduationTarget !== null && fields
    ? graduationTarget > BigInt(fields.sold)
      ? graduationTarget - BigInt(fields.sold)
      : 0n
    : null

  const remainingQuote = useMemo(() => {
    if (!fields?.active || remainingTokens === null ||
        remainingTokens <= 0n || remainingTokens > BigInt(fields.inventory)) {
      return null
    }
    try {
      return calculate(
        fields, decimals, formatUnits(remainingTokens, decimals),
        'buy', slippage, Boolean(recoveryMode)
      )
    } catch {
      return null
    }
  }, [fields, decimals, remainingTokens, slippage, recoveryMode])

  const quote = quotation.result
  const ready = Boolean(!pending && account && correctChain && quote &&
    fields.active && !item.graduated)
  const hasFunds = walletBalance === null || !quote || (
    side === 'buy' ? quote.limit <= walletBalance : quote.amount <= walletBalance
  )

  return (
    <section className="rabbit-launch-trade rabbit-trade-simple" aria-label={`${symbol} trading`}>
      <div className="rabbit-trade-head">
        <div>
          <span className="rabbit-trade-eyebrow">RABBIT CHAIN · LIVE MARKET</span>
          <h3>Trade {symbol}</h3>
          <p>Buy or sell directly on Rabbit Testnet. No VRF registration needed to trade.</p>
        </div>
        <span className="rabbit-trade-live">● Live</span>
      </div>

      <div className="rabbit-launch-trade-tabs" role="group" aria-label="Trade direction">
        <button type="button" className={side === 'buy' ? 'active' : ''}
          aria-pressed={side === 'buy'} disabled={pending}
          onClick={() => { setSide('buy'); setAmount(''); setMessage('') }}>Buy</button>
        <button type="button" className={side === 'sell' ? 'active' : ''}
          aria-pressed={side === 'sell'} disabled={pending}
          onClick={() => { setSide('sell'); setAmount(''); setMessage('') }}>Sell</button>
      </div>

      <div className="rabbit-trade-amount-card">
        <div className="rabbit-trade-line">
          <label htmlFor={`rabbit-amount-${item.key}`}>
            {side === 'buy' ? 'How many tokens do you want?' : 'How many tokens do you want to sell?'}
          </label>
          <span className="rabbit-trade-balance">Balance: {balanceText} {balanceSymbol}</span>
        </div>
        <div className="rabbit-trade-entry">
          <input id={`rabbit-amount-${item.key}`} type="text" inputMode="decimal"
            autoComplete="off" placeholder="0.0" value={amount} disabled={pending}
            onChange={e => { setAmount(e.target.value); setMessage('') }} />
          <strong>{symbol}</strong>
        </div>
        {side === 'buy' && remainingQuote && (
          <div className="rabbit-launch-trade-quote" style={{
            marginTop: 12, marginBottom: 12,
            padding: 14, borderRadius: 12,
            border: '1px solid #dcd0f6',
            background: '#f8f5ff'
          }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>
              Complete this launch
            </strong>
            <p style={{ margin: '4px 0', overflowWrap: 'anywhere' }}>
              Remaining: {formatUnits(remainingTokens, decimals)} {symbol}
            </p>
            <p style={{ margin: '4px 0' }}>
              Estimated total (includes 1% trading fee):
              <strong style={{ display: 'block', fontSize: 19 }}>
                {formatUnits(remainingQuote.payable, remainingQuote.paymentDecimals)} {asset}
              </strong>
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setSide('buy')
                setAmount(formatUnits(remainingTokens, decimals))
                setMessage('')
              }}
              style={{
                width: '100%', marginTop: 8, border: 0,
                borderRadius: 9, padding: '11px 14px',
                background: '#792de8', color: 'white',
                fontWeight: 700, cursor: 'pointer'
              }}
            >
              Buy Remaining {symbol}
            </button>
            <p style={{ fontSize: 11, margin: '8px 0 0' }}>
              Fills the order only. Review the live quote and confirm in your wallet.
            </p>
          </div>
        )}
        <div className="rabbit-trade-quick">
          {[10, 100, 1000].map(n => (
            <button key={n} type="button" disabled={pending}
              onClick={() => setQuickAmount(String(n))}>{n.toLocaleString('en-US')}</button>
          ))}
          <button type="button" disabled={pending || walletBalance === null || recoveryMode === null}
            onClick={setMaxAmount}>Max</button>
        </div>
        {balanceError && <p role="status" className="rabbit-trade-warning">{balanceError}</p>}
      </div>

      <div className="rabbit-launch-trade-quote rabbit-trade-receipt" aria-live="polite">
        <p className="rabbit-trade-receive">
          <span>{side === 'buy' ? 'You pay (estimated)' : 'You receive (estimated)'}</span>
          <strong>{quote ? formatUnits(quote.payable, quote.paymentDecimals) : '—'} {asset}</strong>
        </p>
        {quote && <>
          <p><span>Network market fee (1%)</span>
            <strong>{formatUnits(quote.fee, quote.paymentDecimals)} {asset}</strong></p>
          <p><span>{side === 'buy' ? 'Maximum payment' : 'Minimum received'} (slippage protected)</span>
            <strong>{formatUnits(quote.limit, quote.paymentDecimals)} {asset}</strong></p>
        </>}
        <p className="rabbit-trade-note">Quote uses the current on-chain market curve. The market is checked again before signing.</p>
      </div>

      <details className="rabbit-trade-settings">
        <summary>Trading settings · Slippage {(Number(slippage) / 100).toLocaleString('en-US')}%</summary>
        <label htmlFor={`rabbit-slippage-${item.key}`}>Maximum price movement</label>
        <select id={`rabbit-slippage-${item.key}`} value={slippage}
          onChange={e => setSlippage(e.target.value)} disabled={pending}>
          <option value="50">0.5% · Strict</option>
          <option value="100">1% · Standard</option>
          <option value="200">2% · Flexible</option>
        </select>
        <p>Transactions that exceed your limit are rejected by the contract.</p>
      </details>

      {quotation.error && <p role="alert" className="rabbit-trade-warning">{quotation.error}</p>}
      {!hasFunds && <p role="alert" className="rabbit-trade-warning">
        Insufficient {balanceSymbol} balance for this trade. Enter a smaller amount.
      </p>}
      {!account && <p className="rabbit-trade-warning">Connect your wallet to trade.</p>}
      {account && !correctChain && <p className="rabbit-trade-warning">Switch to Rabbit Testnet (9280).</p>}

      <button type="button" className="product-action rabbit-trade-submit"
        disabled={!ready || !hasFunds} onClick={submit}>
        {pending ? 'Confirm in your wallet…' : side === 'buy' ? `Buy ${symbol}` : `Sell ${symbol}`}
      </button>
      {message && <p role="status" className="rabbit-trade-feedback">{message}</p>}
      <p className="rabbit-trade-footnote">
        Testnet tokens only. Buying with tRUSD or selling tokens may need a one-time wallet approval.
        Quotes and payments are enforced by the deployed market contract.
      </p>
    </section>
  )
}
