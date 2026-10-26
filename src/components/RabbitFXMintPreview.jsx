import React, { useEffect, useState } from 'react'

const S = {"RAB": "0x7ebdb64f", "currency": "0xe5a6b10f", "oracle": "0x7dc0d1d0", "PRICE_SCALE": "0xc33f59d3", "MIN_COLLATERAL_BPS": "0x3a6225be", "rates": "0xdc726205"}
const BASE = 10n ** 18n
const ONE_USD = 100000000n

function format(raw, decimals = 6, precision = 4) {
  const n = BigInt(raw)
  const d = 10n ** BigInt(decimals)
  const fraction = (n % d).toString().padStart(decimals, '0')
    .slice(0, precision).replace(/0+$/, '')
  return (n / d).toString() + (fraction ? '.' + fraction : '')
}

function amountWei(input) {
  const value = String(input || '').trim()
  if (!/^\d+(\.\d{1,18})?$/.test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * BASE + BigInt(fraction.padEnd(18, '0'))
}

function splitWords(hex) {
  if (typeof hex !== 'string' || !/^0x[0-9a-fA-F]+$/.test(hex)) {
    throw Error('Invalid oracle response')
  }
  const payload = hex.slice(2)
  if (payload.length < 192) throw Error('Incomplete oracle response')
  return [0, 1, 2].map(i =>
    BigInt('0x' + payload.slice(i * 64, (i + 1) * 64)))
}

export default function RabbitFXMintPreview({
  market, amount, mode, balances, refreshKey
}) {
  const [oracle, setOracle] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    setOracle(null)
    setChecked(false)

    async function load() {
      try {
        const provider = window.ethereum
        if (!provider?.request) throw Error('Connect MetaMask')
        const chain = await provider.request({method:'eth_chainId'})
        if (BigInt(chain) !== 9280n) throw Error('Use Rabbit Testnet')

        const vault = market?.vault
        if (!/^0x[a-fA-F0-9]{40}$/.test(vault || '')) {
          throw Error('Invalid Vault')
        }

        async function call(to, data) {
          return provider.request({
            method:'eth_call',
            params:[{to, data}, 'latest']
          })
        }

        const [rabKey, fxKey, oracleRaw, scaleHex, minHex] =
          await Promise.all([
            call(vault, S.RAB),
            call(vault, S.currency),
            call(vault, S.oracle),
            call(vault, S.PRICE_SCALE),
            call(vault, S.MIN_COLLATERAL_BPS)
          ])

        if (rabKey.length !== 66 || fxKey.length !== 66) {
          throw Error('Invalid currency identifiers')
        }

        const oracleAddress = '0x' + oracleRaw.slice(-40)
        const scale = BigInt(scaleHex)
        const minimum = BigInt(minHex)

        if (scale !== ONE_USD || minimum < 10000n) {
          throw Error('Unexpected Vault risk parameters')
        }

        const [rabResult, fxResult] = await Promise.all([
          call(oracleAddress, S.rates + rabKey.slice(2)),
          call(oracleAddress, S.rates + fxKey.slice(2))
        ])

        const [rabRate, rabObserved, rabPublished] = splitWords(rabResult)
        const [fxRate, fxObserved, fxPublished] = splitWords(fxResult)

        const now = BigInt(Math.floor(Date.now() / 1000))

        function valid(value, observed, published, maxAge) {
          return value > 0n && observed > 0n &&
            published > 0n && observed <= now &&
            published <= now && now - observed <= maxAge &&
            now - published <= maxAge
        }

        if (!valid(rabRate, rabObserved, rabPublished, 1800n) ||
            !valid(fxRate, fxObserved, fxPublished, 900n)) {
          throw Error('Oracle price unavailable or stale')
        }

        if (active) setOracle({rabRate, fxRate, minimum})
      } catch (err) {
        if (active) setOracle({
          error: err?.message || 'Oracle unavailable'
        })
      } finally {
        if (active) setChecked(true)
      }
    }

    load()
    return () => { active = false }
  }, [market?.vault, refreshKey])

  const input = amountWei(amount)
  const hasBalances = balances && !balances.error &&
    typeof balances.collateral === 'bigint'

  let preview = null

  if (oracle && !oracle.error && hasBalances && input !== null) {
    const before = balances.collateral
    const total = mode === 'deposit'
      ? before + input
      : before >= input ? before - input : null

    if (total !== null) {
      const usd6 = total * oracle.rabRate * 1000000n /
        (BASE * ONE_USD)
      const maxFx6 = usd6 * oracle.fxRate * 10000n /
        (ONE_USD * oracle.minimum)

      // Deployed FX tokens use six decimals.
      if (balances.decimals === 6) {
        const debt = balances.debt
        const remaining = maxFx6 > debt ? maxFx6 - debt : 0n

        preview = { usd6, maxFx6, remaining, debt }
      }
    }
  }

  const surface = {
    padding: 13, borderRadius: 10,
    background:'rgba(255,255,255,.045)'
  }

  return (
    <div style={{
      marginTop:16, padding:16, borderRadius:12,
      border:'1px solid rgba(148,163,184,.25)'
    }}>
      <strong>Collateral & mint preview  fx{market?.currency}</strong>
      <p style={{fontSize:12,opacity:.7,marginTop:6}}>
        Indicative calculation using on-chain Oracle prices.
        Depositing collateral does not automatically mint tokens.
      </p>

      {!checked && <p style={{marginTop:12}}>Checking Oracle...</p>}

      {checked && oracle?.error && (
        <p role="status" style={{color:'#fbbf24',marginTop:12}}>
          Price unavailable: {oracle.error}. Mint capacity cannot be
          calculated safely.
        </p>
      )}

      {checked && !oracle?.error && !hasBalances && (
        <p style={{marginTop:12}}>
          Connect your wallet to calculate your position.
        </p>
      )}

      {preview ? (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',
          gap:10, marginTop:12
        }}>
          <div style={surface}>
            <small>Collateral after operation</small>
            <strong style={{display:'block',marginTop:7}}>
              {format(
                mode === 'deposit'
                  ? balances.collateral + input
                  : balances.collateral - input,
                18, 6
              )} tRAB
            </strong>
          </div>
          <div style={surface}>
            <small>Estimated collateral value</small>
            <strong style={{display:'block',marginTop:7}}>
              {format(preview.usd6)} simulated USD
            </strong>
          </div>
          <div style={surface}>
            <small>Max total debt at minimum ratio</small>
            <strong style={{display:'block',marginTop:7}}>
              {format(preview.maxFx6)} fx{market.currency}
            </strong>
          </div>
          <div style={surface}>
            <small>Additional mint capacity</small>
            <strong style={{display:'block',marginTop:7}}>
              {format(preview.remaining)} fx{market.currency}
            </strong>
          </div>
        </div>
      ) : null}

      <p style={{fontSize:12,opacity:.7,marginTop:12}}>
        Minimum collateral ratio: 150%. Mint is currently locked.
        This is not a purchase quote or a guaranteed swap rate.
        Oracle prices, gas and risk conditions can change.
      </p>
    </div>
  )
}
