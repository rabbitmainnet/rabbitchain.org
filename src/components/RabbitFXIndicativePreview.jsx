import React, { useEffect, useState } from 'react'

const SELECTORS = {"rab": "0x7ebdb64f", "oracle": "0x7dc0d1d0", "rates": "0xdc726205"}
const WAD = 10n ** 18n
const RATE = 100000000n

function parseWei(input) {
  const value = String(input || '').trim()
  if (!/^\d+(\.\d{1,18})?$/.test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  return BigInt(whole) * WAD + BigInt(fraction.padEnd(18, '0'))
}

function asUnits(raw, decimals = 6, places = 4) {
  const n = BigInt(raw)
  const factor = 10n ** BigInt(decimals)
  const fraction = (n % factor).toString()
    .padStart(decimals, '0').slice(0, places)
    .replace(/0+$/, '')
  return (n / factor).toString() + (fraction ? '.' + fraction : '')
}

function parseRate(value) {
  const text = String(value || '')
  if (!/^\d+(\.\d+)?$/.test(text)) return null
  const [whole, fraction = ''] = text.split('.')
  const result = BigInt(whole) * RATE +
    BigInt(fraction.slice(0, 8).padEnd(8, '0'))
  return result > 0n ? result : null
}

function ageText(timestamp) {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp)
  if (!Number.isFinite(seconds) || seconds < 0) return 'unknown age'
  if (seconds < 60) return seconds + ' seconds old'
  if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes old'
  return Math.floor(seconds / 3600) + ' hours old'
}

export default function RabbitFXIndicativePreview({
  market, amount, mode, balances
}) {
  const [fx, setFx] = useState(null)
  const [rab, setRab] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setFx(null)
    setRab(null)
    setError('')

    async function load() {
      try {
        const response = await fetch(
          '/global-markets/forex-market-live.json',
          {cache:'no-store'}
        )
        if (!response.ok) throw Error('FX reference feed unavailable')
        const json = await response.json()
        if (json.chainId !== 9280) throw Error('Wrong market feed')

        const quote = json.currencies?.[market?.currency]
        if (!quote) throw Error('Currency reference unavailable')

        const fxRate = market?.currency === 'USD'
          ? RATE
          : parseRate(quote.marketPrice)

        if (!fxRate) throw Error('Invalid FX reference')

        const stamps = (quote.sources || [])
          .map(x => Number(x.observedAt))
          .filter(x => Number.isFinite(x) && x > 0)

        const observed = market?.currency === 'USD'
          ? Math.floor(Date.now() / 1000)
          : stamps.length ? Math.max(...stamps) : 0

        if (active) setFx({
          rate: fxRate,
          observed,
          source: market?.currency === 'USD'
            ? 'USD simulated identity'
            : (quote.sources || []).map(x => x.provider).join(', ') ||
              'Unspecified source',
          status: quote.displayStatus || quote.status
        })

        const wallet = window.ethereum
        if (!wallet?.request) {
          throw Error('Connect MetaMask to read the last RAB reference')
        }

        const chain = await wallet.request({method:'eth_chainId'})
        if (BigInt(chain) !== 9280n) throw Error('Use Rabbit Testnet')

        const vault = market?.vault
        if (!/^0x[0-9a-fA-F]{40}$/.test(vault || '')) {
          throw Error('Invalid Vault')
        }

        const call = (to, data) => wallet.request({
          method:'eth_call',
          params:[{to, data}, 'latest']
        })

        const [rabKey, oracleRaw] = await Promise.all([
          call(vault, SELECTORS.rab),
          call(vault, SELECTORS.oracle)
        ])

        if (!/^0x[0-9a-fA-F]{64}$/.test(rabKey)) {
          throw Error('Invalid RAB key')
        }

        const oracleAddress = '0x' + oracleRaw.slice(-40)

        const raw = await call(
          oracleAddress,
          SELECTORS.rates + rabKey.slice(2)
        )

        if (!/^0x[0-9a-fA-F]{192,}$/.test(raw)) {
          throw Error('Invalid RAB oracle response')
        }

        const body = raw.slice(2)
        const rate = BigInt('0x' + body.slice(0,64))
        const rabObserved = BigInt('0x' + body.slice(64,128))

        if (rate <= 0n || rabObserved <= 0n) {
          throw Error('RAB reference unavailable')
        }

        if (active) setRab({
          rate,
          observed: Number(rabObserved)
        })
      } catch (e) {
        if (active) setError(e?.message || 'Reference unavailable')
      }
    }

    load()
    const timer = setInterval(load, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [market?.vault, market?.currency])

  const input = parseWei(amount)
  const ready = fx && rab && balances &&
    !balances.error &&
    typeof balances.collateral === 'bigint' &&
    typeof balances.debt === 'bigint' &&
    balances.decimals === 6 &&
    input !== null

  let result = null

  if (ready) {
    const collateral = mode === 'deposit'
      ? balances.collateral + input
      : balances.collateral >= input
        ? balances.collateral - input
        : null

    if (collateral !== null) {
      const usd6 = collateral * rab.rate * 1000000n /
        (WAD * RATE)
      const theoretical = usd6 * fx.rate * 10000n /
        (RATE * 15000n)
      const additional = theoretical > balances.debt
        ? theoretical - balances.debt : 0n

      result = {collateral, usd6, theoretical, additional}
    }
  }

  const rabAge = rab
    ? Math.floor(Date.now() / 1000) - rab.observed
    : null

  const fxAge = fx
    ? Math.floor(Date.now() / 1000) - fx.observed
    : null

  const isStale = rabAge === null || fxAge === null ||
    rabAge < 0 || rabAge > 1800 ||
    fxAge < 0 || fxAge > 345600

  return (
    <section style={{
      marginTop:16, padding:16, borderRadius:12,
      border:'1px solid rgba(148,163,184,.28)',
      background:'rgba(255,255,255,.025)'
    }}>
      <strong>Estimated mint capacity  fx{market?.currency}</strong>
      <p style={{fontSize:12,opacity:.75,marginTop:6}}>
        Testnet simulation only. Depositing tRAB does not buy or
        automatically issue FX tokens.
      </p>

      {result && (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
          gap:10,marginTop:14
        }}>
          {[
            ['Collateral after action',asUnits(result.collateral,18,6)+' tRAB'],
            ['Indicative collateral value',asUnits(result.usd6)+' USD simulated'],
            ['Theoretical total debt limit',asUnits(result.theoretical)+' fx'+market.currency],
            ['Additional theoretical capacity',asUnits(result.additional)+' fx'+market.currency]
          ].map(([label,value]) => (
            <div key={label} style={{
              background:'rgba(255,255,255,.045)',
              padding:12,borderRadius:10
            }}>
              <small>{label}</small>
              <strong style={{display:'block',marginTop:8}}>
                {value}
              </strong>
            </div>
          ))}
        </div>
      )}

      {fx && (
        <p style={{fontSize:12,marginTop:12}}>
          FX reference: {asUnits(fx.rate,8,6)} {market.currency}
          {' / USD simulated'}  {fx.source}
          {'  '}{fx.observed ? ageText(fx.observed) : 'no timestamp'}
        </p>
      )}

      {rab && (
        <p style={{fontSize:12,marginTop:6}}>
          RAB reference: {asUnits(rab.rate,8,8)}
          {' USD simulated / tRAB  '}
          {ageText(rab.observed)}
        </p>
      )}

      {error && (
        <p style={{fontSize:12,color:'#fbbf24',marginTop:10}}>
          {error}
        </p>
      )}

      <p style={{
        fontSize:12,
        color:isStale ? '#fbbf24' : 'inherit',
        marginTop:12
      }}>
        {isStale
          ? 'Historical or incomplete references. Values are illustrative only.'
          : 'Indicative references only; not an executable on-chain quote.'}
        {' '}Mint remains locked. Minimum collateral ratio: 150%.
        Swap and direct purchase require separate liquidity.
      </p>
    </section>
  )
}
