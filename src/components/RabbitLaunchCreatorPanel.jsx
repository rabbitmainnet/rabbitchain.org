import { useState } from 'react'
import {
  createPublicClient, createWalletClient, custom, http,
  parseUnits
} from 'viem'
import {
  RABBIT_LAUNCHPOOL_TESTNET as CFG,
  RABBIT_LAUNCHPOOL_ABI as ABI
} from '../config/launchpool'

const rpc = createPublicClient({ transport: http(CFG.rpc) })

const erc20 = [
  {
    type: 'function', name: 'allowance', stateMutability: 'view',
    inputs: [{ type: 'address' }, { type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function', name: 'approve', stateMutability: 'nonpayable',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [{ type: 'bool' }]
  }
]

export default function RabbitLaunchCreatorPanel({
  item, walletState, walletProvider, onRefresh
}) {
  const [basePrice, setBasePrice] = useState('')
  const [slope, setSlope] = useState('')
  const [lpAmount, setLpAmount] = useState('')
  const [target, setTarget] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const fields = item.fields || {}
  const account = walletState?.account
  const chainOK = Number(walletState?.chainId) === CFG.chainId

  if (!account || !fields.creator ||
      account.toLowerCase() !== fields.creator.toLowerCase()) {
    return null
  }

  async function transact(address, abi, functionName, args) {
    if (!chainOK || !walletProvider?.request)
      throw Error('Connect to Rabbit Testnet (9280)')

    const parameters = {
      account,
      address,
      abi,
      functionName,
      args,
      chain: null
    }

    await rpc.simulateContract(parameters)

    const wallet = createWalletClient({
      transport: custom(walletProvider)
    })

    const hash = await wallet.writeContract(parameters)
    setMessage(`Transaction submitted: ${hash}`)

    const receipt = await rpc.waitForTransactionReceipt({ hash })
    if (receipt.status !== 'success')
      throw Error(`Transaction failed: ${hash}`)
  }

  async function execute(action) {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      await action()
      setMessage('Transaction confirmed on Rabbit Testnet.')
      await onRefresh?.()
    } catch (error) {
      setMessage(error.shortMessage || error.message)
    } finally {
      setBusy(false)
    }
  }

  const marketId = BigInt(item.id)

  async function configure() {
    const price = parseUnits(basePrice, 18)
    const curveSlope = parseUnits(slope || '0', 18)

    if (price <= 0n || price > 10n ** 24n)
      throw Error('Invalid starting price')
    if (curveSlope > 10n ** 18n)
      throw Error('Slope exceeds contract limit')

    await transact(CFG.market, ABI.market, 'configureMarket',
      [marketId, price, curveSlope])
  }

  async function depositLP() {
    const value = parseUnits(lpAmount, item.decimals)
    if (value <= 0n) throw Error('Enter a positive LP inventory')

    const allowance = await rpc.readContract({
      address: fields.token,
      abi: erc20,
      functionName: 'allowance',
      args: [account, CFG.market]
    })

    if (allowance < value) {
      setMessage('Approve tokens for graduation liquidity...')
      await transact(fields.token, erc20, 'approve',
        [CFG.market, value])
    }

    await transact(CFG.market, ABI.market, 'depositGraduationLP',
      [marketId, value])
  }

  async function configureTarget() {
    const value = parseUnits(target, item.decimals)
    if (value <= 0n) throw Error('Enter a positive target')

    await transact(CFG.market, ABI.market,
      'configureGraduationTarget', [marketId, value])
  }

  async function enableGraduation() {
    await transact(CFG.market, ABI.market,
      'enableGraduation', [marketId])
  }

  async function activate() {
    if (!fields.basePrice || BigInt(fields.basePrice) === 0n)
      throw Error('Configure the bonding curve first')

    const [enabled, lp, targetSold] = await Promise.all([
      rpc.readContract({
        address: CFG.market, abi: ABI.market,
        functionName: 'graduationEnabled', args: [marketId]
      }),
      rpc.readContract({
        address: CFG.market, abi: ABI.market,
        functionName: 'graduationLPInventory', args: [marketId]
      }),
      rpc.readContract({
        address: CFG.market, abi: ABI.market,
        functionName: 'graduationTargetSold', args: [marketId]
      })
    ])

    if (!enabled || lp === 0n || targetSold === 0n)
      throw Error('Complete permanent-liquidity graduation setup before activation')

    await transact(CFG.market, ABI.market, 'activateMarket',
      [marketId])
  }

  async function graduate() {
    const [market, target, lp, enabled, graduated, recovering, ready] =
      await Promise.all([
        rpc.readContract({
          address: CFG.market, abi: ABI.market,
          functionName: 'markets', args: [marketId]
        }),
        rpc.readContract({
          address: CFG.market, abi: ABI.market,
          functionName: 'graduationTargetSold', args: [marketId]
        }),
        rpc.readContract({
          address: CFG.market, abi: ABI.market,
          functionName: 'graduationLPInventory', args: [marketId]
        }),
        rpc.readContract({
          address: CFG.market, abi: ABI.market,
          functionName: 'graduationEnabled', args: [marketId]
        }),
        rpc.readContract({
          address: CFG.market, abi: ABI.market,
          functionName: 'graduated', args: [marketId]
        }),
        rpc.readContract({
          address: CFG.market, abi: ABI.market,
          functionName: 'graduationRecoveryMode', args: [marketId]
        }),
        rpc.readContract({
          address: CFG.market, abi: ABI.market,
          functionName: 'graduationInfrastructureReady'
        })
      ])

    const outputs = ABI.market.find(
      x => x.type === 'function' && x.name === 'markets'
    ).outputs

    const state = Object.fromEntries(
      outputs.map((field, i) => [field.name, market[i]])
    )

    if (!ready || !enabled || graduated || recovering)
      throw Error('Graduation is not available for this market')

    if (!state.active || target === 0n || lp === 0n ||
        state.sold < target)
      throw Error('Graduation target or liquidity requirements not met')

    if (!window.confirm(
      'TESTNET ONLY: Graduate this market to RabbitSwap? ' +
      'The initial LP tokens will be permanently locked. Continue?'
    )) return

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)

    await transact(
      CFG.market, ABI.market, 'graduateMarket',
      [marketId, deadline]
    )
  }

  return (
    <section className="rabbit-launch-trade">
      <h3>Creator Management · Market #{item.id}</h3>
      <p>Configure the curve and permanent graduation liquidity before opening trading.</p>

      <label>
        <span>STARTING PRICE · 18-DECIMAL CURVE UNITS</span>
        <input value={basePrice}
          onChange={e => setBasePrice(e.target.value)}
          placeholder="0.001" inputMode="decimal" />
      </label>

      <label>
        <span>CURVE SLOPE · 18-DECIMAL UNITS (MAX 1)</span>
        <input value={slope}
          onChange={e => setSlope(e.target.value)}
          placeholder="0" inputMode="decimal" />
      </label>

      <button disabled={busy || !chainOK || fields.active}
        onClick={() => execute(configure)}>
        Save Curve Settings
      </button>

      <label>
        <span>TOKENS RESERVED FOR PERMANENT LP</span>
        <input value={lpAmount}
          onChange={e => setLpAmount(e.target.value)}
          placeholder="10000" inputMode="decimal" />
      </label>

      <button disabled={busy || !chainOK || fields.active}
        onClick={() => execute(depositLP)}>
        Deposit Graduation Liquidity Tokens
      </button>

      <label>
        <span>GRADUATION SALES TARGET · TOKENS</span>
        <input value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="50000" inputMode="decimal" />
      </label>

      <button disabled={busy || !chainOK || fields.active}
        onClick={() => execute(configureTarget)}>
        Save Graduation Target
      </button>

      <button disabled={busy || !chainOK || fields.active}
        onClick={() => execute(enableGraduation)}>
        Enable Permanent LP Graduation
      </button>

      <button className="product-action"
        disabled={busy || !chainOK || fields.active}
        onClick={() => execute(activate)}>
        {busy ? 'Processing...' : 'Activate Launch Market'}
      </button>

      <button
        type="button"
        disabled={busy || !chainOK || !fields.active || item.graduated}
        onClick={() => execute(graduate)}
      >
        Graduate to RabbitSwap · Permanent LP
      </button>

      {message && <p role="status">{message}</p>}

      <p className="product-disclaimer">
        TESTNET ONLY. Deposited tokens are controlled by the Market
        contract. Permanent LP cannot be withdrawn after locking.
        Review all settings before signing.
      </p>
    </section>
  )
}
