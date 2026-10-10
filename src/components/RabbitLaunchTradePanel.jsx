import { useEffect, useMemo, useState } from 'react'
import {
  createPublicClient, createWalletClient, custom, http,
  formatUnits, parseUnits, zeroAddress
} from 'viem'
import {
  RABBIT_LAUNCHPOOL_TESTNET as CFG,
  RABBIT_LAUNCHPOOL_ABI as ABI
} from '../config/launchpool'

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
  transport: http(CFG.rpc, { timeout: 20000 })
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
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState('100')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [recoveryMode, setRecoveryMode] = useState(null)

  useEffect(() => {
    let cancelled = false
    setRecoveryMode(null)
    rpc.readContract({
      address: CFG.market,
      abi: ABI.market,
      functionName: 'graduationRecoveryMode',
      args: [BigInt(item.id)]
    }).then(value => {
      if (!cancelled) setRecoveryMode(Boolean(value))
    }).catch(() => {
      if (!cancelled) setRecoveryMode(null)
    })
    return () => { cancelled = true }
  }, [item.id])

  const fields = item.fields || {}
  const account = walletState?.account
  const correctChain = Number(walletState?.chainId) === 9280
  const decimals = item.decimals || 18
  const symbol = item.symbol || 'TOKEN'
  const asset = fields.paymentAsset?.toLowerCase() === zeroAddress
    ? 'tRAB' : 'tRUSD'

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
        address: CFG.market,
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
        address: CFG.market,
        abi: ABI.market,
        functionName: 'graduated',
        args: [BigInt(item.id)]
      })
      if (alreadyGraduated)
        throw Error('This market has already graduated to RabbitSwap')

      const liveRecovery = await rpc.readContract({
        address: CFG.market,
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
        await approveIfNeeded(CFG.tRUSD, CFG.market, q.limit)
      }
      if (side === 'sell') {
        await approveIfNeeded(fields.token, CFG.market, q.amount)
      }

      const latestMarket = await rpc.readContract({
        address: CFG.market,
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
          address: CFG.market,
          abi: ABI.market,
          functionName: 'graduationRecoveryMode',
          args: [BigInt(item.id)]
        }),
        rpc.readContract({
          address: CFG.market,
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
            CFG.market, ABI.market, 'buyToken',
            [BigInt(item.id), q.amount, q.limit]
          )
        } else {
          // Solidity buyNative requires msg.value == exact total.
          await send(
            CFG.market, ABI.market, 'buyNative',
            [BigInt(item.id), q.amount, q.limit],
            finalQuote.payable
          )
        }
      } else {
        await send(
          CFG.market, ABI.market,
          q.trusd ? 'sellToken' : 'sellNative',
          [BigInt(item.id), q.amount, q.limit]
        )
      }

      setAmount('')
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

  return (
    <section className="rabbit-launch-trade">
      <div className="rabbit-launch-trade-tabs">
        <button
          type="button"
          className={side === 'buy' ? 'active' : ''}
          onClick={() => { setSide('buy'); setMessage('') }}
        >
          Buy
        </button>
        <button
          type="button"
          className={side === 'sell' ? 'active' : ''}
          onClick={() => { setSide('sell'); setMessage('') }}
        >
          Sell
        </button>
      </div>

      <label>
        <span>AMOUNT · {symbol}</span>
        <input
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </label>

      <label>
        <span>SLIPPAGE TOLERANCE</span>
        <select
          value={slippage}
          onChange={e => setSlippage(e.target.value)}
        >
          <option value="50">0.5%</option>
          <option value="100">1%</option>
          <option value="200">2%</option>
        </select>
      </label>

      {quotation.result && (
        <div className="rabbit-launch-trade-quote">
          <p>
            <span>{side === 'buy' ? 'Estimated cost' : 'Estimated return'}</span>
            <strong>
              {formatUnits(
                quotation.result.payable,
                quotation.result.paymentDecimals
              )} {asset}
            </strong>
          </p>
          <p>
            <span>Trading fee</span>
            <strong>
              {formatUnits(
                quotation.result.fee,
                quotation.result.paymentDecimals
              )} {asset}
            </strong>
          </p>
          <p>
            <span>{side === 'buy' ? 'Maximum payment' : 'Minimum received'}</span>
            <strong>
              {formatUnits(
                quotation.result.limit,
                quotation.result.paymentDecimals
              )} {asset}
            </strong>
          </p>
        </div>
      )}

      {quotation.error && (
        <p className="product-disclaimer">{quotation.error}</p>
      )}

      <button
        type="button"
        className="product-action"
        disabled={
          pending || !account || !correctChain ||
          !quotation.result || !fields.active || item.graduated
        }
        onClick={submit}
      >
        {pending ? 'Confirming...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
      </button>

      {message && <p role="status" className="product-disclaimer">{message}</p>}

      <p className="product-disclaimer">
        Rabbit Testnet only · 1% trading fee. Quotes may change before
        confirmation. Transactions require wallet approval.
      </p>
    </section>
  )
}
