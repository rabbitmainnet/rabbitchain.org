import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Coins, Factory, Flame, Layers3, Network,
  Repeat2, Rocket, ShieldCheck, Wallet, Waves,
} from 'lucide-react'
import { NETWORKS } from '../config/networks'

const tools = {
  swap: { icon: Repeat2, label: 'SWAP', title: 'Rabbit Swap', intro: 'Trade supported Rabbit-native assets through the official wallet-connected interface.' },
  liquidity: { icon: Waves, label: 'LIQUIDITY', title: 'Liquidity', intro: 'Create and manage supported liquidity positions when Testnet markets are activated.' },
  launchpool: { icon: Flame, label: 'LAUNCHPOOL', title: 'Launchpool', intro: 'Discover official launch campaigns and participation windows in one place.' },
  factory: { icon: Factory, label: 'TOKEN FACTORY', title: 'Token Factory', intro: 'Deploy standard EVM tokens through a guided interface with transparent parameters.' },
  bridge: { icon: Layers3, label: 'BRIDGE', title: 'Bridge', intro: 'Move supported assets through official routes when bridge infrastructure is available.' },
  portfolio: { icon: Coins, label: 'PORTFOLIO', title: 'Portfolio', intro: 'See connected-wallet context, network information and supported Rabbit assets.' },
}

const toolOrder = ['swap', 'liquidity', 'launchpool', 'factory', 'bridge', 'portfolio']

function ToolPanel({ tool, walletState, onConnect }) {
  const entry = tools[tool]
  const Icon = entry.icon

  if (tool === 'swap') {
    return (
      <div className="product-panel product-swap">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>PRE-LAUNCH</b></div>
        <div className="swap-box"><span>YOU PAY</span><div><strong>0.00</strong><button>RAB ▾</button></div><small>Balance appears after wallet + network activation</small></div>
        <div className="swap-switch">↓</div>
        <div className="swap-box"><span>YOU RECEIVE</span><div><strong>0.00</strong><button>RUSD ▾</button></div><small>Testnet asset route</small></div>
        <button className="product-action" onClick={onConnect}>{walletState?.account ? 'Trading activates with liquidity' : 'Connect wallet'}</button>
        <p className="product-disclaimer">This interface does not imply a live market. Swaps activate only after public liquidity and contracts are intentionally released.</p>
      </div>
    )
  }

  if (tool === 'liquidity') {
    return (
      <div className="product-panel">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>PRE-LAUNCH</b></div>
        <div className="product-empty"><Waves size={34} /><h3>No public pools yet.</h3><p>Official Rabbit markets will appear here after contracts and Testnet liquidity are activated.</p><button onClick={onConnect}>{walletState?.account ? 'Wallet connected' : 'Connect wallet'}</button></div>
      </div>
    )
  }

  if (tool === 'launchpool') {
    return (
      <div className="product-panel">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>PRE-LAUNCH</b></div>
        <div className="launchpool-card"><span>OFFICIAL CAMPAIGNS</span><h3>No active launchpools.</h3><p>Future campaigns can surface project details, participation windows and contract references here.</p><div><small>STATUS</small><strong>Waiting for public activation</strong></div></div>
      </div>
    )
  }

  if (tool === 'factory') {
    return (
      <div className="product-panel">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>PRE-LAUNCH</b></div>
        <div className="factory-form">
          <label><span>TOKEN NAME</span><input disabled placeholder="My Rabbit Token" /></label>
          <label><span>SYMBOL</span><input disabled placeholder="MRT" /></label>
          <div><label><span>DECIMALS</span><input disabled placeholder="18" /></label><label><span>SUPPLY</span><input disabled placeholder="1,000,000" /></label></div>
          <button className="product-action" onClick={onConnect}>{walletState?.account ? 'Factory activates with contracts' : 'Connect wallet to prepare'}</button>
        </div>
      </div>
    )
  }

  if (tool === 'bridge') {
    return (
      <div className="product-panel">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>PRE-LAUNCH</b></div>
        <div className="bridge-route"><div><span>FROM</span><strong>External network</strong><small>Official route not published</small></div><ArrowRight size={20} /><div><span>TO</span><strong>Rabbit Testnet</strong><small>Chain ID 9280</small></div></div>
        <div className="product-empty compact"><Layers3 size={30} /><h3>No official bridge route is live.</h3><p>The portal will expose only supported routes with verified contracts.</p></div>
      </div>
    )
  }

  return (
    <div className="product-panel">
      <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{walletState?.account ? 'CONNECTED' : 'WALLET READY'}</b></div>
      <div className="portfolio-identity"><div className="portfolio-mark"><img src="/rabbit-mark.png" alt="" /></div><div><span>WALLET</span><strong>{walletState?.account ? `${walletState.account.slice(0, 8)}…${walletState.account.slice(-6)}` : 'Not connected'}</strong><small>Public address only · no custody</small></div></div>
      <div className="portfolio-grid"><div><span>NETWORK</span><strong>Rabbit Testnet</strong></div><div><span>CHAIN ID</span><strong>9280</strong></div><div><span>NATIVE ASSET</span><strong>RAB</strong></div><div><span>DATA</span><strong>Available with public RPC</strong></div></div>
      <button className="product-action" onClick={onConnect}>{walletState?.account ? 'Manage wallet' : 'Connect wallet'}</button>
    </div>
  )
}

export default function Platform({ walletState, onConnect, onAddNetwork }) {
  const { tool } = useParams()
  const activeTool = tools[tool] ? tool : null
  const testnet = NETWORKS.testnet

  if (activeTool) {
    const entry = tools[activeTool]
    return (
      <main className="platform-product-page">
        <section className="platform-product-shell shell">
          <aside className="platform-sidebar">
            <Link className="platform-sidebar-brand" to="/platform"><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT</b><small>PLATFORM</small></span></Link>
            <nav><Link to="/platform">Overview</Link>{toolOrder.map((key) => { const Icon = tools[key].icon; return <Link className={activeTool === key ? 'active' : ''} to={`/platform/${key}`} key={key}><Icon size={16} />{tools[key].title}</Link> })}</nav>
            <div className="platform-sidebar-foot"><span>NETWORK</span><strong>Rabbit Testnet</strong><small>Chain ID 9280 · Pre-launch</small></div>
          </aside>

          <section className="platform-workspace">
            <div className="platform-workspace-head"><div><span>{entry.label}</span><h1>{entry.title}</h1><p>{entry.intro}</p></div><button className="button secondary" onClick={onConnect}><Wallet size={15} />{walletState?.account ? 'Manage wallet' : 'Connect wallet'}</button></div>
            <div className="platform-product-grid"><ToolPanel tool={activeTool} walletState={walletState} onConnect={onConnect} /><aside className="product-context"><span>RABBIT PLATFORM</span><h3>Product interface first. Services only when verified.</h3><p>These screens are the official application surface, but they stay explicit about availability. No market, bridge or contract is presented as live before its release gate is complete.</p><div><ShieldCheck size={17} /><span><b>No seed phrase</b><small>Wallet connection uses the public account only.</small></span></div><div><Network size={17} /><span><b>Testnet first</b><small>Chain ID 9280 is the first public application environment.</small></span></div><button className="button primary" onClick={() => onAddNetwork?.(testnet)}>Add Rabbit Testnet</button></aside></div>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="platform-v2-hero">
        <div className="shell platform-v2-hero-grid">
          <div className="platform-v2-copy">
            <span className="hero-eyebrow"><i /> RABBIT PLATFORM · OFFICIAL APPLICATION LAYER</span>
            <h1>Everything you use on Rabbit. <em>One product surface.</em></h1>
            <p>Wallet, trading, liquidity, launches, token creation, bridging and portfolio context organized as one product — with every module showing its real launch state.</p>
            <div className="hero-ctas"><button className="button primary" onClick={onConnect}><Wallet size={16} />{walletState?.account ? 'Manage wallet' : 'Connect wallet'}</button><button className="button secondary" onClick={() => onAddNetwork?.(testnet)}>Add Rabbit Testnet</button></div>
            <div className="platform-principles"><span><ShieldCheck size={15} />Non-custodial wallet connection</span><span><Network size={15} />Testnet-first product surface</span></div>
          </div>

          <div className="platform-v2-window">
            <div className="platform-v2-window-head"><div><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT PLATFORM</b><small>TESTNET WORKSPACE · CHAIN ID 9280</small></span></div><b>PRE-LAUNCH</b></div>
            <div className="platform-v2-wallet"><div><span>CONNECTED WALLET</span><strong>{walletState?.account ? `${walletState.account.slice(0, 8)}…${walletState.account.slice(-6)}` : 'Not connected'}</strong></div><button onClick={onConnect}>{walletState?.account ? 'Manage' : 'Connect'}</button></div>
            <div className="platform-v2-module-list">{toolOrder.map((key, index) => { const Icon = tools[key].icon; return <Link className={index === 0 ? 'featured' : ''} to={`/platform/${key}`} key={key}><span>0{index + 1}</span><Icon size={18} /><div><b>{tools[key].title}</b><small>{tools[key].intro}</small></div><em>PRE-LAUNCH</em><ArrowUpRight size={15} /></Link> })}</div>
          </div>
        </div>
      </section>

      <section className="platform-v2-product">
        <div className="shell platform-v2-product-head"><div><span className="section-kicker">PRODUCT SURFACE</span><h2>Six modules. One coherent interface.</h2></div><p>The Platform is a first-class part of Rabbit, while RabbitChain.org remains the source of truth for network status, releases and documentation.</p></div>
        <div className="shell platform-v2-grid">
          {toolOrder.map((key, index) => { const Icon = tools[key].icon; return <Link to={`/platform/${key}`} key={key}><span>0{index + 1}</span><div><Icon size={21} /><em>PRE-LAUNCH</em></div><h3>{tools[key].title}</h3><p>{tools[key].intro}</p><b>Open module <ArrowRight size={14} /></b></Link> })}
        </div>
      </section>

      <section className="platform-v2-stack">
        <div className="shell platform-v2-stack-grid">
          <div><span className="section-kicker">THE RABBIT STACK</span><h2>Applications above. Protocol below.</h2><p>Rabbit Platform uses the same wallet, RPC, EVM, LCQ and P2P surfaces documented across RabbitChain.org.</p><Link className="inline-link light-link" to="/lcq">Understand LCQ <ArrowRight size={14} /></Link></div>
          <div className="platform-v2-stack-rail"><div><small>05</small><span>APPLICATIONS</span><strong>Swap · Liquidity · Launchpool · Factory · Bridge · Portfolio</strong></div><i /><div><small>04</small><span>WALLET & RPC</span><strong>EVM wallet · WalletConnect · JSON-RPC</strong></div><i /><div><small>03</small><span>EXECUTION</span><strong>EVM · transactions · smart contracts</strong></div><i /><div className="accent"><small>02</small><span>CONSENSUS</span><strong>LCQ · producer · committee</strong></div><i /><div><small>01</small><span>NETWORK</span><strong>P2P · nodes · mining</strong></div></div>
        </div>
      </section>

      <section className="platform-v2-actions">
        <div className="shell">
          <Link to="/developers"><Rocket size={21} /><span><small>BUILD</small><b>Integrate with Rabbit</b><em>EVM, JSON-RPC and network parameters.</em></span><ArrowRight size={17} /></Link>
          <Link to="/status"><ShieldCheck size={21} /><span><small>VERIFY</small><b>Know what is live</b><em>Every service keeps an explicit readiness state.</em></span><ArrowRight size={17} /></Link>
          <button onClick={onConnect}><Wallet size={21} /><span><small>CONNECT</small><b>Wallet-first access</b><em>Injected wallets and WalletConnect.</em></span><ArrowRight size={17} /></button>
        </div>
      </section>
    </main>
  )
}
