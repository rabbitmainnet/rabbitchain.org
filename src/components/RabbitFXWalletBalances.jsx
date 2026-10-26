import React, { useEffect, useState } from 'react'


const RPC = 'https://rpc-testnet.rabbitchain.org'

function formatUnits(hex, decimals) {
  const value = BigInt(hex)
  const scale = 10n ** BigInt(decimals)
  const whole = value / scale
  const fraction = (value % scale)
    .toString()
    .padStart(decimals, '0')
    .slice(0, 6)
    .replace(/0+$/, '')

  return whole.toLocaleString('en-US') +
    (fraction ? '.' + fraction : '')
}

async function callRPC(method, params, signal) {
  const response = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    }),
    signal
  })

  if (!response.ok) throw Error('RPC HTTP ' + response.status)

  const json = await response.json()

  if (json.error) throw Error(json.error.message || 'RPC error')
  if (typeof json.result !== 'string') throw Error('Invalid RPC response')

  return json.result
}

export default function RabbitFXWalletBalances({ market, account, networkKey }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const vault = market?.vault
  const token = market?.token
  const currency = market?.currency

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    setState(null)
    setError('')

    if (!token || networkKey !== 'testnet') {
      clearTimeout(timeout)
      return () => { active = false; controller.abort() }
    }

    async function load() {
      setLoading(true)

      try {
        const chain = await callRPC('eth_chainId', [], controller.signal)
        if (BigInt(chain) !== 9280n) throw Error('Wrong network')

        const validAccount = account && /^0x[0-9a-fA-F]{40}$/.test(account)
        const balanceCall = validAccount
          ? '0x70a08231' + account.slice(2).toLowerCase().padStart(64, '0')
          : null

        const [decimalsHex, supplyHex, balanceHex] = await Promise.all([
          callRPC('eth_call', [{ to: token, data: '0x313ce567' }, 'latest'], controller.signal),
          callRPC('eth_call', [{ to: token, data: '0x18160ddd' }, 'latest'], controller.signal),
          balanceCall
            ? callRPC('eth_call', [{ to: token, data: balanceCall }, 'latest'], controller.signal)
            : Promise.resolve(null)
        ])

        const decimals = Number(BigInt(decimalsHex))
        if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
          throw Error('Invalid token decimals')
        }

        let collateral = null
        let debt = null

        if (validAccount && /^0x[0-9a-fA-F]{40}$/.test(vault || '')) {
          const encodedAccount = account.slice(2).toLowerCase().padStart(64, '0')
          const [collateralHex, debtHex] = await Promise.all([
            callRPC('eth_call', [{
              to: vault,
              data: '0xa5fdc5de' + encodedAccount
            }, 'latest'], controller.signal),
            callRPC('eth_call', [{
              to: vault,
              data: '0x9b6c56ec' + encodedAccount
            }, 'latest'], controller.signal)
          ])

          collateral = formatUnits(collateralHex, 18)
          debt = formatUnits(debtHex, decimals)
        }

        if (active) setState({
          supply: formatUnits(supplyHex, decimals),
          balance: balanceHex === null ? null : formatUnits(balanceHex, decimals),
          collateral,
          debt
        })
      } catch (err) {
        if (active) setError(err.name === 'AbortError'
          ? 'RPC request timed out'
          : err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [token, vault, account, networkKey])

  return (
    <div style={{
      padding: '18px 26px',
      borderTop: '1px solid rgba(125,145,170,.22)'
    }}>
      <div style={{ marginBottom: 12 }}>
        <strong>On-chain token data  fx{currency}</strong>
        <p style={{ fontSize: 12, opacity: .75, margin: '6px 0' }}>
          Read directly from Rabbit Testnet 9280
        </p>
      </div>

      {loading && <p>Reading blockchain...</p>}
      {error && <p role="alert" style={{ color: '#ffb4a8' }}>{error}</p>}

      {state && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}>
          <div style={{
            background: 'rgba(255,255,255,.04)',
            padding: 14,
            borderRadius: 12
          }}>
            <small>Total token supply</small>
            <strong style={{ display: 'block', marginTop: 8 }}>
              {state.supply} fx{currency}
            </strong>
          </div>

          <div style={{
            background: 'rgba(255,255,255,.04)',
            padding: 14,
            borderRadius: 12
          }}>
            <small>Your wallet balance</small>
            <strong style={{ display: 'block', marginTop: 8 }}>
              {account
                ? `${state.balance ?? 'Unavailable'} fx${currency}`
                : 'Connect wallet'}
            </strong>
          </div>
        </div>
      )}

      {state && account && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginTop: 12
        }}>
          <div style={{ background: 'rgba(255,255,255,.04)', padding: 14, borderRadius: 12 }}>
            <small>Your deposited collateral</small>
            <strong style={{ display: 'block', marginTop: 8 }}>
              {state.collateral ?? 'Unavailable'} tRAB
            </strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,.04)', padding: 14, borderRadius: 12 }}>
            <small>Your outstanding debt</small>
            <strong style={{ display: 'block', marginTop: 8 }}>
              {state.debt ?? 'Unavailable'} fx{currency}
            </strong>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, opacity: .7, marginTop: 12 }}>
        On-chain balances, collateral and debt. Read-only; mint remains locked.
      </p>
    </div>
  )
}