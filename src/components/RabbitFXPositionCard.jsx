import { useEffect, useState } from 'react'
import { readRabbitFXPosition, readRabbitFXSwapBridge } from '../lib/rabbitGlobalFX.js'

export default function RabbitFXPositionCard({ account }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [bridge, setBridge] = useState(null)
  const [bridgeError, setBridgeError] = useState('')

  useEffect(() => {
    let active = true

    if (!account) {
      setData(null)
      setError('')
      return () => { active = false }
    }

    setLoading(true)
    setError('')

    readRabbitFXPosition(account)
      .then(result => {
        if (active) setData(result)
      })
      .catch(err => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [account])


  useEffect(() => {
    let active = true
    readRabbitFXSwapBridge()
      .then(value => {
        if (active) {
          setBridge(value)
          setBridgeError('')
        }
      })
      .catch(err => {
        if (active) setBridgeError(err.shortMessage || err.message)
      })
    return () => { active = false }
  }, [])

  return (
    <section style={{ margin: '24px 0' }}>
      <h2>Your FX collateral and debt</h2>

      {!account && <p>Connect your wallet to view your position.</p>}
      {loading && <p>Loading on-chain position...</p>}
      {error && <p role="alert">{error}</p>}

      {data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 16,
        }}>
          {[
            ['Wallet tRAB', data.walletTRAB],
            ['Collateral tRAB', data.collateralTRAB],
            ['Debt fxUSD', data.debtFXUSD],
            ['Balance fxUSD', data.walletFXUSD],
            ['Reference USD/RAB', data.oracle.priceUSDPerRAB],
            ['Oracle', data.oracle.validForNewMint ? 'Valid' : 'Unavailable / stale'],
          ].map(([name, value]) => (
            <div key={name} style={{ padding: 16, border: '1px solid #d7dce5', borderRadius: 12 }}>
              <small>{name}</small>
              <strong style={{ display: 'block', marginTop: 8, overflowWrap: 'anywhere' }}>
                {value}
              </strong>
            </div>
          ))}
        </div>
      )}


      <div style={{
        marginTop: 18,
        padding: 16,
        border: '1px solid #d7dce5',
        borderRadius: 12,
      }}>
        <strong>RabbitSwap price bridge</strong>
        {bridgeError && (
          <p role="alert">Price unavailable: {bridgeError}</p>
        )}
        {bridge && (
          <>
            <p>1 tRAB spot  {bridge.spotUSDPerRAB.toFixed(6)} tRUSD</p>
            <p>Swap quote for 1 tRAB  {bridge.executableUSDForOneRAB.toFixed(6)} tRUSD</p>
            <p>Pool reserves: {bridge.reserveTRAB} tRAB / {bridge.reserveTRUSD} tRUSD</p>
            <p>Implied BRL per tRAB: {
              bridge.impliedBRLPerRAB == null
                ? 'FX reference unavailable'
                : bridge.impliedBRLPerRAB.toFixed(6)
            }</p>
            <p>Implied EUR per tRAB: {
              bridge.impliedEURPerRAB == null
                ? 'FX reference unavailable'
                : bridge.impliedEURPerRAB.toFixed(6)
            }</p>
            <small>
              ECB reference: {bridge.referenceDate}.
              Spot price is informational and not approved
              for collateral valuation or mint.
            </small>
          </>
        )}
      </div>

      <p style={{ fontSize: 12, marginTop: 12 }}>
        Legacy beta: read-only. Public financial operations remain disabled.
      </p>
    </section>
  )
}
