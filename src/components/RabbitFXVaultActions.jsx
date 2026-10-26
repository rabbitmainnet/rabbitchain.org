import RabbitFXIndicativePreview from './RabbitFXIndicativePreview'
import RabbitFXMintPreview from './RabbitFXMintPreview'
import React, { useEffect, useState, useCallback } from 'react'

const CHAIN = 9280n
const EXPLORER = 'https://explorer-testnet.rabbitchain.org/tx/'

const SELECTOR = {
  deposit: '0xd0e30db0',
  withdraw: '0x2e1a7d4d',
  collateral: '0xa5fdc5de',
  debt: '0x9b6c56ec',
  balanceOf: '0x70a08231',
  decimals: '0x313ce567'
}

const WEI = 10n ** 18n
const GAS_RESERVE = 2n * 10n ** 16n

function parseAmount(value, decimals = 18) {
  const s = String(value).trim()
  const pattern = new RegExp('^[0-9]+(?:\\.[0-9]{1,' + decimals + '})?$')
  if (!pattern.test(s)) throw new Error('Invalid amount or decimal precision.')
  const [whole, fraction = ''] = s.split('.')
  const result = BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, '0'))
  if (result <= 0n) throw new Error('Amount must be greater than zero.')
  return result
}

function formatAmount(value, decimals = 18, places = 6) {
  const n = BigInt(value || '0')
  const base = 10n ** BigInt(decimals)
  const integer = n / base
  const fraction = (n % base).toString().padStart(decimals, '0')
    .slice(0, places).replace(/0+$/, '')
  return integer.toString() + (fraction ? '.' + fraction : '')
}

function encodeAddress(address) {
  return address.slice(2).toLowerCase().padStart(64, '0')
}

const validAddress = s => /^0x[0-9a-fA-F]{40}$/.test(s || '')

export default function RabbitFXVaultActions({ market, account }) {
  const [mode, setMode] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [hash, setHash] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(true)

  const vault = market?.vault
  const token = market?.token
  const currency = market?.currency || ''

  const refresh = useCallback(() => setRefreshKey(n => n + 1), [])

  useEffect(() => {
    let active = true
    const provider = window.ethereum

    async function load() {
      setLoading(true)
      setBalances(null)

      if (!provider?.request ||
          !validAddress(vault) || !validAddress(token)) {
        if (active) setLoading(false)
        return
      }

      try {
        const chain = await provider.request({ method: 'eth_chainId' })

        if (BigInt(chain) !== CHAIN) {
          throw new Error('Switch MetaMask to Rabbit Testnet 9280.')
        }

        const accounts = await provider.request({ method: 'eth_accounts' })
        const address = accounts?.[0]

        if (!validAddress(address)) {
          throw new Error('Connect your wallet to view balances.')
        }

        if (validAddress(account) &&
            account.toLowerCase() !== address.toLowerCase()) {
          throw new Error('Wallet differs from the connected site account.')
        }

        const encoded = encodeAddress(address)

        const call = (to, data) =>
          provider.request({
            method: 'eth_call',
            params: [{ to, data }, 'latest']
          })

        const [walletHex, collateralHex, debtHex, tokenHex, decimalsHex] =
          await Promise.all([
            provider.request({
              method: 'eth_getBalance',
              params: [address, 'latest']
            }),
            call(vault, SELECTOR.collateral + encoded),
            call(vault, SELECTOR.debt + encoded),
            call(token, SELECTOR.balanceOf + encoded),
            call(token, SELECTOR.decimals)
          ])

        const decimals = Number(BigInt(decimalsHex))

        if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) {
          throw new Error('Unexpected FX token decimals.')
        }

        if (active) {
          setBalances({
            wallet: BigInt(walletHex),
            collateral: BigInt(collateralHex),
            debt: BigInt(debtHex),
            token: BigInt(tokenHex),
            decimals,
            address
          })
        }
      } catch (err) {
        if (active) {
          setBalances({ error: err?.message || 'Unable to read balances.' })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    const timer = setInterval(load, 30000)
    provider?.on?.('accountsChanged', refresh)
    provider?.on?.('chainChanged', refresh)

    return () => {
      active = false
      clearInterval(timer)
      provider?.removeListener?.('accountsChanged', refresh)
      provider?.removeListener?.('chainChanged', refresh)
    }
  }, [vault, token, account, refreshKey, refresh])

  function useMax() {
    if (!balances || balances.error) return

    if (mode === 'deposit') {
      const available = balances.wallet > GAS_RESERVE
        ? balances.wallet - GAS_RESERVE
        : 0n
      setAmount(formatAmount(available, 18, 18))
    } else {
      // This is only the deposited amount, not guaranteed safe to withdraw.
      setAmount(formatAmount(balances.collateral, 18, 18))
    }
  }

  async function execute() {
    setMessage('')
    setHash('')

    const provider = window.ethereum
    if (!provider?.request) {
      setMessage('MetaMask is not available.')
      return
    }

    setBusy(true)
    try {
      const value = parseAmount(amount)

      if (!balances || balances.error) {
        throw new Error('Wallet balances must be available first.')
      }

      const chain = await provider.request({ method: 'eth_chainId' })
      if (BigInt(chain) !== CHAIN) {
        throw new Error('Wrong network. Use Rabbit Testnet 9280.')
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      })
      const from = accounts?.[0]

      if (!validAddress(from) ||
          from.toLowerCase() !== balances.address.toLowerCase()) {
        throw new Error('Wallet changed. Refresh balances first.')
      }

      if (mode === 'deposit' && value > balances.wallet) {
        throw new Error('Not enough tRAB in your wallet.')
      }

      if (mode === 'withdraw' && value > balances.collateral) {
        throw new Error('Amount exceeds deposited collateral.')
      }

      const tx = {
        from,
        to: vault,
        data: mode === 'deposit'
          ? SELECTOR.deposit
          : SELECTOR.withdraw + value.toString(16).padStart(64, '0')
      }

      if (mode === 'deposit') {
        tx.value = '0x' + value.toString(16)
      }

      const gasHex = await provider.request({
        method: 'eth_estimateGas',
        params: [tx]
      })

      if (mode === 'deposit') {
        const gasPriceHex = await provider.request({
          method: 'eth_gasPrice'
        })
        const estimatedTotal = value +
          BigInt(gasHex) * BigInt(gasPriceHex)

        if (estimatedTotal > balances.wallet) {
          throw new Error('Insufficient tRAB for deposit plus estimated gas.')
        }
      }

      // Only the user can authorize the transaction.
      const sent = await provider.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })

      setHash(sent)
      setMessage('Transaction submitted. Waiting for confirmation...')

      let receipt = null
      for (let i = 0; i < 60; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        receipt = await provider.request({
          method: 'eth_getTransactionReceipt',
          params: [sent]
        })
        if (receipt) break
      }

      if (!receipt) {
        setMessage('Still pending. Check the Explorer.')
      } else if (BigInt(receipt.status || '0x0') === 1n) {
        setMessage('Transaction confirmed. Balances are updating.')
        setAmount('')
        refresh()
      } else {
        setMessage('Transaction reverted. Check the Explorer.')
        refresh()
      }
    } catch (err) {
      if (err?.code === 4001) {
        setMessage('Transaction cancelled in MetaMask. Nothing was sent.')
      } else {
        setMessage(err?.shortMessage || err?.message || 'Operation failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  const surface = {
    background: 'rgba(255,255,255,.045)',
    padding: 14,
    borderRadius: 12
  }

  return (
    <section style={{
      marginTop: 18, padding: 20,
      border: '1px solid rgba(148,163,184,.24)',
      borderRadius: 16, background: 'rgba(15,23,42,.22)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12
      }}>
        <div>
          <strong style={{fontSize: 17}}>Vault operations  fx{currency}</strong>
          <p style={{fontSize: 12, opacity: .7, marginTop: 5}}>
            Rabbit Testnet 9280  On-chain wallet balances
          </p>
        </div>
        <button type="button" onClick={refresh}
          disabled={busy} style={{
            padding: '8px 12px', borderRadius: 9,
            background: 'transparent',
            color: 'inherit',
            border: '1px solid rgba(148,163,184,.35)'
          }}>
          Refresh balances
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
        gap: 10, marginTop: 16
      }}>
        <div style={surface}>
          <small>Wallet balance</small>
          <strong style={{display:'block',marginTop:8}}>
            {loading ? 'Loading...' :
              balances && !balances.error
                ? formatAmount(balances.wallet) + ' tRAB'
                : ''}
          </strong>
        </div>
        <div style={surface}>
          <small>Deposited collateral</small>
          <strong style={{display:'block',marginTop:8}}>
            {loading ? 'Loading...' :
              balances && !balances.error
                ? formatAmount(balances.collateral) + ' tRAB'
                : ''}
          </strong>
        </div>
        <div style={surface}>
          <small>Your token balance</small>
          <strong style={{display:'block',marginTop:8}}>
            {loading ? 'Loading...' :
              balances && !balances.error
                ? formatAmount(balances.token, balances.decimals) +
                  ' fx' + currency
                : ''}
          </strong>
        </div>
        <div style={surface}>
          <small>Outstanding debt</small>
          <strong style={{display:'block',marginTop:8}}>
            {loading ? 'Loading...' :
              balances && !balances.error
                ? formatAmount(balances.debt, balances.decimals) +
                  ' fx' + currency
                : ''}
          </strong>
        </div>
      </div>

      {balances?.error && (
        <p role="alert" style={{color:'#fca5a5',marginTop:12}}>
          {balances.error}
        </p>
      )}

      <div style={{display:'flex',gap:8,marginTop:20}}>
        {['deposit','withdraw'].map(option => (
          <button key={option} type="button"
            disabled={busy}
            onClick={() => {
              setMode(option); setAmount(''); setMessage(''); setHash('')
            }}
            style={{
              padding:'10px 16px',borderRadius:9,
              border:'1px solid rgba(148,163,184,.3)',
              background:mode === option ? '#2563eb' : 'transparent',
              color:'#fff'
            }}>
            {option === 'deposit' ? 'Deposit' : 'Withdraw'}
          </button>
        ))}
      </div>

      <label style={{display:'block',marginTop:16,fontSize:13}}>
        {mode === 'deposit' ? 'Deposit amount' : 'Withdraw amount'} (tRAB)
      </label>

      <div style={{display:'flex',gap:10,marginTop:8,flexWrap:'wrap'}}>
        <input type="text" inputMode="decimal"
          placeholder="0.0" value={amount}
          disabled={busy}
          onChange={e => setAmount(e.target.value)}
          style={{
            flex:'1 1 170px',minWidth:100,padding:12,
            borderRadius:9,
            border:'1px solid rgba(148,163,184,.35)',
            background:'rgba(0,0,0,.22)',color:'inherit'
          }}/>
        <button type="button" onClick={useMax}
          disabled={busy || !balances || !!balances.error}
          style={{
            padding:'10px 14px',borderRadius:9,
            background:'rgba(59,130,246,.15)',color:'#93c5fd',
            border:'1px solid rgba(59,130,246,.4)'
          }}>
          MAX
        </button>
        <button type="button" onClick={execute}
          disabled={busy || !amount.trim() ||
            !balances || !!balances.error}
          style={{
            padding:'12px 18px',borderRadius:9,border:0,
            background:'#2563eb',color:'#fff',
            opacity:busy ? .6 : 1
          }}>
          {busy ? 'Processing...' :
            mode === 'deposit' ? 'Deposit tRAB' : 'Withdraw tRAB'}
        </button>
      </div>

      <p style={{fontSize:12,opacity:.7,marginTop:12}}>
        {mode === 'deposit'
          ? 'MAX reserves 0.02 tRAB for gas. Estimated gas is checked before submission.'
          : 'MAX means all deposited tRAB, not necessarily the amount safe to withdraw. Debt and Oracle prices can restrict withdrawals.'}
      </p>

      <RabbitFXIndicativePreview
        market={market}
        amount={amount}
        mode={mode}
        balances={balances}
      />
      <RabbitFXMintPreview
        market={market}
        amount={amount}
        mode={mode}
        balances={balances}
        refreshKey={refreshKey}
      />
      <p style={{fontSize:12,opacity:.7,marginTop:6}}>
        MetaMask approval is required. Only confirmed transactions update the position.
      </p>

      {message && (
        <p role="status" style={{
          marginTop:12,fontSize:13,overflowWrap:'anywhere'
        }}>{message}</p>
      )}
      {hash && (
        <a href={EXPLORER + hash}
          target="_blank" rel="noopener noreferrer"
          style={{
            display:'inline-block',marginTop:8,
            color:'#93c5fd',overflowWrap:'anywhere'
          }}>
          View transaction in Explorer
        </a>
      )}
    </section>
  )
}
