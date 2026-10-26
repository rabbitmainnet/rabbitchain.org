import { getFlagUrl } from "../lib/rabbitFlags.js"
import market from '../config/rabbitFXMarketSnapshot.json'

export default function RabbitFXMarketCard() {

  const flagUrl = getFlagUrl(market?.currency || market?.code || code || currency)

  const sourceAgeDays = Math.floor(
    (Date.now() - Date.parse(`${market.sourceDate}T00:00:00Z`))
    / 86400000
  )

  const referenceFresh = (
    Number.isFinite(sourceAgeDays) &&
    sourceAgeDays >= 0 &&
    sourceAgeDays <= 5
  )

  const available = market.currencies.filter(
    item => item.referenceAvailable
  ).length

  return (
    <section style={{ margin: '24px 0' }}>
      <h2>Global FX  World Currency References</h2>

      <p>
        European Central Bank  Reference date: {market.sourceDate}
        {'  '}{available}/{market.currencies.length}
        {' '}currencies with reference values
      </p>

      {!referenceFresh && (
        <p role="alert" style={{ color: '#b42318' }}>
          Reference snapshot is outdated.
          Do not use these values for issuance or execution.
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
        gap: 12,
        marginTop: 16,
      }}>
        {market.currencies.map(item => (
          <div
            key={item.code}
            style={{
              border: '1px solid var(--border-color, #dfe3ee)',
              borderRadius: 12,
              padding: 14,
              minWidth: 0,
            }}
          >
            <strong>{item.symbol}</strong>
            <p style={{ margin: '8px 0', overflowWrap: 'anywhere' }}>
              {referenceFresh && item.referenceAvailable
                ? `${Number(item.usdPerUnit).toPrecision(7)} USD`
                : 'Reference unavailable'}
            </p>
            <small>
              {item.vault && item.token
                ? 'Contract registered'
                : 'Vault not deployed'}
            </small>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, marginTop: 14 }}>
        Informational official FX references only. This is a build-time
        snapshot, not a live oracle or an executable swap quote.
        Fiat references do not establish a market price for tRAB.
        Stablecoin mint and redemption remain unavailable.
      </p>
    </section>
  )
}
