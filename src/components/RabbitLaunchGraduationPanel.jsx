import { useCallback, useEffect, useState } from 'react'
import { createPublicClient, createWalletClient, custom, http, formatUnits } from 'viem'
import { RABBIT_LAUNCHPOOL_V3 as CFG, RABBIT_LAUNCHPOOL_V3_ABI as ABI } from '../config/launchpool-v3'

const rpc = createPublicClient({ transport: http(CFG.rpc, { timeout: 20000 }) })

export default function RabbitLaunchGraduationPanel({ item, walletState, walletProvider, onRefresh }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const account = walletState?.account
  const networkOK = Number(walletState?.chainId) === 9280
  const marketId = BigInt(item.id)
  const marketAddress = item.marketAddress || CFG.market

  const load = useCallback(async () => {
    const functions = ['graduationEnabled', 'graduationTargetSold', 'graduationLPInventory', 'graduated', 'graduationRecoveryMode', 'graduationInfrastructureReady']
    const values = await Promise.all(functions.map(name => rpc.readContract({
      address: marketAddress, abi: ABI.market, functionName: name,
      args: name === 'graduationInfrastructureReady' ? [] : [marketId]
    })))
    return Object.fromEntries(functions.map((name, index) => [name, values[index]]))
  }, [item.id, marketAddress])

  useEffect(() => {
    let mounted = true
    setState(null)
    setError('')
    load().then(result => { if (mounted) setState(result) })
      .catch(err => { if (mounted) setError(err.shortMessage || err.message) })
    return () => { mounted = false }
  }, [load])

  const sold = BigInt(item.fields?.sold || '0')
  const target = state?.graduationTargetSold || 0n
  const ready = Boolean(state && state.graduationEnabled && state.graduationLPInventory > 0n &&
    state.graduationInfrastructureReady && !state.graduated && !state.graduationRecoveryMode &&
    item.fields?.active && target > 0n && sold >= target)
  // Four decimal places without rounding an incomplete sale to 100%.
  const percentage = target > 0n
    ? Number((sold * 1000000n) / target) / 10000
    : 0
  const remaining = target > sold ? target - sold : 0n
  const decimals = item.decimals ?? 18
  const symbol = item.symbol || 'tokens'

  async function graduate() {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      const fresh = await load()
      const latest = await rpc.readContract({ address: marketAddress, abi: ABI.market, functionName: 'markets', args: [marketId] })
      const fields = ABI.market.find(entry => entry.type === 'function' && entry.name === 'markets').outputs
      const market = Object.fromEntries(fields.map((field, i) => [field.name, latest[i]]))
      if (!fresh.graduationInfrastructureReady || !fresh.graduationEnabled || !fresh.graduationLPInventory ||
          fresh.graduated || fresh.graduationRecoveryMode || !market.active ||
          !fresh.graduationTargetSold || market.sold < fresh.graduationTargetSold)
        throw Error('Graduation requirements are not met yet. Refresh the market.')
      if (!account || !networkOK || !walletProvider?.request)
        throw Error('Connect a wallet to Rabbit Testnet (9280).')
      const chainId = await walletProvider.request({ method: 'eth_chainId' })
      const accounts = await walletProvider.request({ method: 'eth_accounts' })
      if (BigInt(chainId) !== 9280n || !accounts.some(a => a.toLowerCase() === account.toLowerCase()))
        throw Error('Wallet account or network changed. Reconnect and try again.')
      if (!window.confirm('Graduate this market to RabbitSwap? Initial liquidity LP tokens will be permanently locked.')) return
      const parameters = {
        account, address: marketAddress, abi: ABI.market,
        functionName: 'graduateMarket', args: [marketId, BigInt(Math.floor(Date.now() / 1000) + 1200)], chain: null
      }
      await rpc.simulateContract(parameters)
      const wallet = createWalletClient({ transport: custom(walletProvider) })
      const hash = await wallet.writeContract(parameters)
      setMessage(`Graduation submitted: ${hash}`)
      const receipt = await rpc.waitForTransactionReceipt({ hash })
      if (receipt.status !== 'success') throw Error(`Graduation failed: ${hash}`)
      setMessage('Graduation confirmed. Initial RabbitSwap LP is permanently locked.')
      setState(await load())
      await onRefresh?.()
    } catch (err) {
      setMessage(err.shortMessage || err.message)
    } finally { setBusy(false) }
  }

  return (
    <section className="rlp-graduation-simple" aria-label="RabbitSwap graduation">
      <div className="rlp-graduation-simple-head">
        <div><h3>RabbitSwap Graduation</h3><p>When the sale target is reached, anyone can complete the transfer to RabbitSwap.</p></div>
        <span className="rlp-graduation-tag">Permanent LP lock</span>
      </div>
      {error ? <p role="status">Unable to load graduation status: {error}</p> : !state ? <p>Checking graduation status…</p> : (
        <>
          <div className="rlp-graduation-progress-caption">
            <span>Sales target</span>
            <strong>{percentage.toFixed(4)}%</strong>
          </div>
          <div className="rlp-graduation-progress">
            <span style={{ width: `${Math.min(100, percentage)}%` }} />
          </div>
          <p>{formatUnits(sold, decimals)} / {formatUnits(target, decimals)} {symbol} sold toward graduation</p>
          {!state.graduated && remaining > 0n && (
            <div role="status" style={{
              padding: '14px 16px',
              margin: '12px 0',
              border: '1px solid var(--rlp-border, #ddd)',
              borderRadius: 12
            }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                Tokens remaining to complete the sale
              </div>
              <strong style={{ fontSize: 20, overflowWrap: 'anywhere' }}>
                {formatUnits(remaining, decimals)} {symbol}
              </strong>
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>
                Liquidity graduation starts after the full sales target
                and all on-chain requirements are satisfied.
              </div>
            </div>
          )}
          {state.graduated ? <p className="rlp-graduation-good">Graduated to RabbitSwap.</p> :
            state.graduationRecoveryMode ? <p>Graduation recovery is active for this market.</p> :
            ready ? <button type="button" className="rlp-primary" disabled={busy || !account || !networkOK} onClick={graduate}>{busy ? 'Confirming graduation…' : 'Complete Graduation →'}</button> :
            <p>Graduation becomes available once the on-chain sales and liquidity requirements are met. No action is needed now.</p>}
          {ready && (!account || !networkOK) && <p>Connect a Rabbit Testnet wallet to complete graduation.</p>}
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  )
}
