import RabbitFXVaultActions from './RabbitFXVaultActions'
import React, { useEffect, useMemo, useState } from 'react'
import RabbitFXWalletBalances from './RabbitFXWalletBalances'
import { ArrowUpRight, CheckCircle2, Coins, ExternalLink, Globe2, LockKeyhole, RefreshCw, Search, ShieldCheck, Wallet, XCircle } from 'lucide-react'
import RabbitOtherMarketsLive from './RabbitOtherMarketsLive'
import '../rabbit-global-markets-dashboard.css'

const EXPLORER = 'https://explorer-testnet.rabbitchain.org/address/'
const ORACLE = '0xE8D1675cCe79586F044793e577033235D7A4035C'
const FLAG_CODES = { AED:"ae", ARS:"ar", AUD:"au", BRL:"br", CAD:"ca", CHF:"ch", CNY:"cn", EUR:"eu", GBP:"gb", INR:"in", JPY:"jp", KRW:"kr", MXN:"mx", NZD:"nz", RUB:"ru", SAR:"sa", SGD:"sg", TRY:"tr", USD:"us", ZAR:"za" }
const NAMES = { AED:'Emirati Dirham', ARS:'Argentine Peso', AUD:'Australian Dollar', BRL:'Brazilian Real', CAD:'Canadian Dollar', CHF:'Swiss Franc', CNY:'Chinese Yuan', EUR:'Euro', GBP:'British Pound', INR:'Indian Rupee', JPY:'Japanese Yen', KRW:'South Korean Won', MXN:'Mexican Peso', NZD:'New Zealand Dollar', RUB:'Russian Ruble', SAR:'Saudi Riyal', SGD:'Singapore Dollar', TRY:'Turkish Lira', USD:'US Dollar', ZAR:'South African Rand' }
const short = x => x ? `${x.slice(0, 7)}…${x.slice(-5)}` : '—'
const quote = x => Number.isFinite(Number(x)) && x != null ? Number(x).toLocaleString('en-US', { maximumFractionDigits: 6, minimumFractionDigits: 2 }) : '—'
const validAddress = a => /^0x[0-9a-fA-F]{40}$/.test(a || '')

function Flag({ currency, large = false }) {
  const flag = FLAG_CODES[currency]
  return <span className={large ? "rgm-flag rgm-flag-large" : "rgm-flag"}>
    {flag ? <img src={`https://flagcdn.com/w80/${flag}.png`} width="40" height="28" loading="lazy" alt={`Flag: ${currency}`} style={{width:"40px",height:"28px",objectFit:"cover",borderRadius:2,background:"transparent",boxShadow:"none",padding:0,border:"none"}} /> : currency}
  </span>
}

function ContractLink({ label, value }) {
  return <a className="rgm-contract-link" href={EXPLORER + value} target="_blank" rel="noopener noreferrer"><span>{label}</span><code>{short(value)}</code><ExternalLink size={13} /></a>
}

export default function RabbitGlobalMarketsDashboard({ walletState, onConnect, onSwitchNetwork, networkKey }) {
  const [markets, setMarkets] = useState([])
  const [loadError, setLoadError] = useState('')
  const [live, setLive] = useState(null)
  const [liveError, setLiveError] = useState('')
  const [section, setSection] = useState('fx')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('BRL')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const account = walletState?.account || null

  useEffect(() => {
    let active = true
    fetch('/global-markets/fx-contracts-9280.json', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw Error(`Manifest HTTP ${r.status}`); return r.json() })
      .then(m => {
        if (m.chainId !== 9280 || m.oracleV7?.toLowerCase() !== ORACLE.toLowerCase() || m.markets?.length !== 20 ||
          m.markets.some(x => !validAddress(x.vault) || !validAddress(x.token) || !validAddress(x.backstop))) throw Error('Invalid FX registry')
        if (active) { setMarkets(m.markets); setLoadError('') }
      })
      .catch(e => { if (active) setLoadError(e.message) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    const local = typeof window !== 'undefined' && ['localhost','127.0.0.1'].includes(window.location.hostname)
    if (!local) { setLiveError('Live prices are not yet published on this website.'); return }
    const refresh = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 9000)
      try {
        const response = await fetch('/global-markets/forex-market-live.json', { cache:'no-store', signal:controller.signal })
        if (!response.ok) throw Error(`HTTP ${response.status}`)
        const result = await response.json()
        if (active) { setLive(result); setLiveError(''); setUpdatedAt(new Date()) }
      } catch (e) { if (active) setLiveError(`FX feed unavailable: ${e.message}`) }
      finally { clearTimeout(timeout) }
    }
    refresh()
    const timer = setInterval(refresh, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [refreshKey])

  const filtered = useMemo(() => markets.filter(m => `${m.currency} ${NAMES[m.currency] || ''}`.toLowerCase().includes(search.toLowerCase().trim())), [markets, search])
  const active = markets.find(m => m.currency === selected) || markets[0]
  const statusFor = code => {
    const p = live?.currencies?.[code]
    if (!p) return { text:'No quote', kind:'off' }
    if (p.displayStatus === 'SOURCE_DELAYED') return { text:'Delayed', kind:'warn' }
    if (p.status === 'TWO_SOURCES_AGREE') return { text:'2 sources aligned', kind:'ok' }
    if (p.status === 'USD_IDENTITY') return { text:'USD reference', kind:'neutral' }
    if (p.status === 'SINGLE_SOURCE_ONLY') return { text:'1 source', kind:'warn' }
    if (p.status === 'PRICE_DIVERGENCE') return { text:'Price divergence', kind:'off' }
    return { text:'Not validated', kind:'off' }
  }
  const aligned = markets.filter(m => statusFor(m.currency).kind === 'ok').length

  return <div className="rgm-root">
    <div className="rgm-hero">
      <div className="rgm-hero-pattern" aria-hidden="true" />
      <div className="rgm-hero-main">
        <div className="rgm-eyebrow"><span className="rgm-pulse" /> RABBIT CHAIN <span className="rgm-dot">/</span> TESTNET 9280</div>
        <h1>Global markets.<br /><span>Built on Rabbit.</span></h1>
        <p>Explore 20 synthetic world currencies and 10 reference markets. Real on-chain contracts, real-world indicative prices, testnet-only assets.</p>
        <div className="rgm-hero-actions">
          <button type="button" className="rgm-button rgm-button-primary" onClick={onConnect}><Wallet size={16} /> {account ? short(account) : 'Connect wallet'}</button>
          <a className="rgm-button rgm-button-ghost" href={EXPLORER + ORACLE} target="_blank" rel="noopener noreferrer">Oracle V7 <ArrowUpRight size={16}/></a>
        </div>
      </div>
      <div className="rgm-hero-orbit" aria-hidden="true"><div className="rgm-orbit-center"><Coins size={76}/></div><div className="rgm-orbit-one"/><div className="rgm-orbit-two"/></div>
    </div>

    <div className="rgm-stats">
      <article><small>GLOBAL FX MARKETS</small><strong>{markets.length || '—'}<span> / 20</span></strong><p>On-chain synthetic currencies</p></article>
      <article><small>REGISTERED CONTRACTS</small><strong>{markets.length ? markets.length * 3 : '—'}</strong><p>Vaults · Tokens · Backstops</p></article>
      <article><small>OTHER MARKETS</small><strong>10</strong><p>Metals · Energy · Indices · Stocks</p></article>
      <article><small>PRICE CONFIRMATIONS</small><strong>{live ? aligned : '—'}</strong><p>FX pairs with aligned sources</p></article>
    </div>

    <div className="rgm-note"><ShieldCheck size={18}/><div><strong>Testnet laboratory — not real USD.</strong> tRUSD represents simulated USD. Contracts are deployed, but minting remains disabled. Quotes are indicative and do not authorize collateral valuation, trades or liquidations.</div></div>
    {networkKey !== 'testnet' && <div className="rgm-network"><span>Switch to Rabbit Testnet (9280) to inspect these deployments.</span><button onClick={() => onSwitchNetwork?.()} type="button">Switch network <ArrowUpRight size={14}/></button></div>}

    <div className="rgm-tabs" role="tablist" aria-label="Market categories">
      <button role="tab" aria-selected={section==='fx'} className={section==='fx'?'is-active':''} onClick={()=>setSection('fx')}><Globe2 size={15}/> World currencies <span>20</span></button>
      <button role="tab" aria-selected={section==='other'} className={section==='other'?'is-active':''} onClick={()=>setSection('other')}><Coins size={15}/> Commodities & indices <span>10</span></button>
    </div>

    {section === 'fx' ? <>
      {active && <section className="rgm-detail">
        <div className="rgm-detail-head"><div className="rgm-detail-title"><Flag currency={active.currency} large /><div><span className="rgm-kicker">SELECTED MARKET</span><h3>fx{active.currency} <small>{NAMES[active.currency]}</small></h3></div></div><span className="rgm-locked"><LockKeyhole size={14}/> Mint locked</span></div>
        <div className="rgm-detail-inner"><div className="rgm-detail-metrics"><div><small>Market reference</small><strong>{quote(live?.currencies?.[active.currency]?.marketPrice)} {active.currency}</strong><span>Per simulated USD · indicative</span></div><div><small>Quote assessment</small><strong>{statusFor(active.currency).text}</strong><span>Not an on-chain execution quote</span></div><div><small>Deployment</small><strong>Testnet 9280</strong><span>Mint disabled at deployment</span></div></div>
        <div className="rgm-contracts"><ContractLink label="Vault" value={active.vault}/><ContractLink label={`fx${active.currency} token`} value={active.token}/><ContractLink label="Stability Backstop" value={active.backstop}/><ContractLink label="Oracle V7" value={ORACLE}/></div></div>
        <RabbitFXWalletBalances market={active} account={account} networkKey={networkKey} />
        <RabbitFXVaultActions market={active} account={account} networkKey={networkKey} />
<div className="rgm-detail-bottom"><LockKeyhole size={15}/> Deposit, mint, repay and withdraw controls are intentionally unavailable until the economic tests are completed.</div>
      </section>}
      <div className="rgm-section-header"><div><span className="rgm-kicker">RABBIT GLOBAL FX</span><h2>World currency markets</h2><p>Choose a market to explore its live references and on-chain deployment.</p></div><div className="rgm-tools"><label className="rgm-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search currency..." aria-label="Search currency" /></label><button type="button" className="rgm-refresh" aria-label="Refresh quotes" onClick={()=>setRefreshKey(k=>k+1)}><RefreshCw size={17}/></button></div></div>
      {loadError && <div className="rgm-error" role="alert">Contract registry: {loadError}</div>}
      {liveError && <div className="rgm-feed-message">{liveError}</div>}
      <div className="rgm-grid">
        {filtered.map(m => { const p=live?.currencies?.[m.currency]; const st=statusFor(m.currency); return <button type="button" key={m.currency} onClick={()=>setSelected(m.currency)} className={`rgm-market ${selected===m.currency?'is-selected':''}`}>
          <div className="rgm-market-top"><Flag currency={m.currency} /><span className={`rgm-status rgm-status-${st.kind}`}><span className="rgm-status-dot"/>{st.text}</span></div>
          <strong>fx{m.currency}</strong><span className="rgm-market-name">{NAMES[m.currency] || m.currency}</span>
          <div className="rgm-market-price"><small>1 simulated USD ≈</small><b>{quote(p?.marketPrice)} <em>{m.currency}</em></b></div>
          <div className="rgm-market-foot"><span><CheckCircle2 size={13}/> Contract deployed</span><ArrowUpRight size={16}/></div>
        </button> })}
      </div>
      {!loadError && filtered.length === 0 && <p className="rgm-empty">No currencies match this search.</p>}

      <div className="rgm-fine"><span><Globe2 size={14}/> Quotes refresh every 30 seconds in local preview; source observation times may be older.</span><span>{updatedAt ? `Last browser fetch: ${updatedAt.toLocaleTimeString()}` : 'Price service not connected'}</span></div>
    </> : <section className="rgm-other"><div className="rgm-section-header"><div><span className="rgm-kicker">ADDITIONAL MARKET WATCH</span><h2>Commodities, indices & equities</h2><p>Ten experimental market references. These are not deployed FX Vaults.</p></div></div><RabbitOtherMarketsLive /></section>}
    <footer className="rgm-footer"><Coins size={18}/><span>Rabbit Global Markets · Rabbit Chain Testnet · One eligible wallet, one fair chance.</span><a href={EXPLORER + ORACLE} target="_blank" rel="noopener noreferrer">Explore Oracle <ArrowUpRight size={14}/></a></footer>
  </div>
}
