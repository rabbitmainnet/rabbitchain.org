import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Coins, Droplets, Factory, Flame, Layers3, Network,
  Repeat2, Rocket, ShieldCheck, Wallet, Waves,
} from 'lucide-react'
import { NETWORKS } from '../config/networks'

const tools = {
  swap: { icon: Repeat2, label: 'SWAP', title: 'Rabbit Swap', intro: 'Trade supported Rabbit-native assets through the official wallet-connected interface.' },
  liquidity: { icon: Waves, label: 'LIQUIDITY', title: 'Liquidity', intro: 'Create and manage supported liquidity positions when Testnet markets are activated.' },
  launchpool: { icon: Flame, label: 'LAUNCHPOOL', title: 'Launchpool', intro: 'Discover official launch campaigns and participation windows in one place.' },
  factory: { icon: Factory, label: 'TOKEN FACTORY', title: 'Token Factory', intro: 'Deploy standard EVM tokens through a guided interface with transparent parameters.' },
  bridge: { icon: Layers3, label: 'BRIDGE', title: 'Bridge', intro: 'Move supported assets through official routes when bridge infrastructure is available.' },
  staking: { icon: Coins, label: 'STAKING', title: 'Staking', intro: 'Stake supported Rabbit assets through the official non-custodial application interface when staking contracts are released.' },
  p2p: { icon: Network, label: 'P2P', title: 'P2P', intro: 'Direct peer-to-peer interaction through the Rabbit application layer when the public service is released.' },
  faucet: {
    icon: Droplets,
    label: 'FAUCET',
    title: 'Faucet',
    intro: 'Request test RAB and RUSD for Rabbit Testnet development and network testing.'
  },
}

const toolOrder = ['swap', 'liquidity', 'staking', 'bridge', 'p2p', 'launchpool', 'factory', 'faucet']

function PlatformNetworkSwitch({ value, onChange }) {
  return (
    <div className="platform-network-switch" aria-label="Rabbit Platform network">
      <button
        type="button"
        className={value === 'testnet' ? 'active' : ''}
        onClick={() => onChange('testnet')}
      >
        <b>TESTNET</b>
        <small>9280</small>
      </button>

      <button
        type="button"
        className={value === 'mainnet' ? 'active' : ''}
        onClick={() => onChange('mainnet')}
      >
        <b>MAINNET</b>
        <small>928</small>
      </button>
    </div>
  )
}


function ToolPanel({ tool, walletState, onConnect, networkKey }) {
  const entry = tools[tool]
  const Icon = entry.icon
  const statusText = networkKey === 'mainnet'
    ? 'MAINNET · COMING LATER'
    : 'PRE-LAUNCH'

  if (tool === 'swap') {
    return (
      <div className="product-panel product-swap">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{statusText}</b></div>
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
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{statusText}</b></div>
        <div className="product-empty"><Waves size={34} /><h3>No public pools yet.</h3><p>Official Rabbit markets will appear here after contracts and Testnet liquidity are activated.</p><button onClick={onConnect}>{walletState?.account ? 'Wallet connected' : 'Connect wallet'}</button></div>
      </div>
    )
  }

  if (tool === 'launchpool') {
    return (
      <div className="product-panel">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{statusText}</b></div>
        <div className="launchpool-card"><span>OFFICIAL CAMPAIGNS</span><h3>No active launchpools.</h3><p>Future campaigns can surface project details, participation windows and contract references here.</p><div><small>STATUS</small><strong>Waiting for public activation</strong></div></div>
      </div>
    )
  }

  if (tool === 'factory') {
    return (
      <div className="product-panel">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{statusText}</b></div>
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
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{statusText}</b></div>
        <div className="bridge-route"><div><span>FROM</span><strong>External network</strong><small>Official route not published</small></div><ArrowRight size={20} /><div><span>TO</span><strong>Rabbit Testnet</strong><small>Chain ID 9280</small></div></div>
        <div className="product-empty compact"><Layers3 size={30} /><h3>No official bridge route is live.</h3><p>The portal will expose only supported routes with verified contracts.</p></div>
      </div>
    )
  }

  if (tool === 'p2p') {
    return (
      <div className="product-panel">
        <div className="product-panel-title">
          <div><Network size={20} /><span>{entry.label}</span></div>
          <b>{statusText}</b>
        </div>

        <div className="product-empty">
          <Network size={34} />
          <h3>P2P is preparing for public Testnet.</h3>
          <p>
            The peer-to-peer application will appear here only after its
            public service and release checks are complete.
          </p>
          <button onClick={onConnect}>
            {walletState?.account ? 'Wallet connected' : 'Connect wallet'}
          </button>
        </div>
      </div>
    )
  }

  if (tool === 'staking') {
    return (
      <div className="product-panel product-staking">
        <div className="product-panel-title">
          <div><Coins size={20} /><span>STAKING</span></div>
          <b>{statusText}</b>
        </div>

        <div className="staking-product-intro">
          <span>NON-CUSTODIAL STAKING</span>
          <h3>Stake RAB through Rabbit Platform.</h3>
          <p>
            Staking will activate only after the official contracts,
            reward parameters and public release checks are completed.
          </p>
        </div>

        <div className="staking-product-grid">
          <div>
            <span>ASSET</span>
            <strong>RAB</strong>
            <small>Rabbit native asset</small>
          </div>

          <div>
            <span>NETWORK</span>
            <strong>{networkKey === 'mainnet' ? 'Mainnet' : 'Testnet'}</strong>
            <small>{networkKey === 'mainnet' ? 'Chain ID 928' : 'Chain ID 9280'}</small>
          </div>

          <div>
            <span>STATUS</span>
            <strong>{networkKey === 'mainnet' ? 'Coming later' : 'Pre-launch'}</strong>
            <small>Contracts not published yet</small>
          </div>
        </div>

        <button className="product-action" onClick={onConnect}>
          {walletState?.account ? 'Wallet connected' : 'Connect wallet'}
        </button>

        <p className="product-disclaimer">
          No staking contract or reward program is presented as live before its official release.
        </p>
      </div>
    )
  }

  if (tool === 'faucet') {
    return (
      <div className="product-panel product-faucet">
        <div className="product-panel-title">
          <div><Droplets size={20} /><span>FAUCET</span></div>
          <b>{statusText}</b>
        </div>

        <div className="faucet-intro">
          <h3>Rabbit Testnet Faucet</h3>
          <p>Test assets for development, wallet testing and Rabbit Testnet participation.</p>
        </div>

        <div className="faucet-assets">
          <div>
            <span>TEST ASSET</span>
            <strong>RAB</strong>
            <small>Rabbit Testnet native asset</small>
            <button disabled>Available when Faucet is live</button>
          </div>

          <div>
            <span>TEST ASSET</span>
            <strong>RUSD</strong>
            <small>Rabbit Testnet testing asset</small>
            <button disabled>Available when Faucet is live</button>
          </div>

          <div>
            <span>TEST ASSET</span>
            <strong>tUSDT</strong>
            <small>Test token for USDT-compatible flows</small>
            <button disabled>Available when Faucet is live</button>
          </div>

          <div>
            <span>TEST ASSET</span>
            <strong>tUSDC</strong>
            <small>Test token for USDC-compatible flows</small>
            <button disabled>Available when Faucet is live</button>
          </div>
        </div>

        <p className="product-disclaimer">
          Test assets have no monetary value. tUSDT and tUSDC are Rabbit Testnet
          testing tokens and are not official Tether or Circle assets.
        </p>
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
  const navigate = useNavigate()

  const [platformNetwork, setPlatformNetwork] = useState('testnet')

  const selectedNetwork = NETWORKS[platformNetwork]

  const visibleTools = platformNetwork === 'mainnet'
    ? toolOrder.filter((key) => key !== 'faucet')
    : toolOrder

  const networkName = platformNetwork === 'mainnet'
    ? 'Rabbit Mainnet'
    : 'Rabbit Testnet'

  const networkChainId = platformNetwork === 'mainnet'
    ? '928'
    : '9280'

  function selectPlatformNetwork(key) {
    setPlatformNetwork(key)

    if (key === 'mainnet' && activeTool === 'faucet') {
      navigate('/platform/swap')
    }
  }

  if (activeTool) {
    const entry = tools[activeTool]
    return (
      <main className="platform-product-page">
        <section className="platform-product-shell shell">
          <aside className="platform-sidebar">
            <PlatformNetworkSwitch
              value={platformNetwork}
              onChange={selectPlatformNetwork}
            />

            <nav>
              {visibleTools.map((key) => {
                const Icon = tools[key].icon

                return (
                  <Link
                    className={activeTool === key ? 'active' : ''}
                    to={`/platform/${key}`}
                    key={key}
                  >
                    <Icon size={16} />
                    {tools[key].title}
                  </Link>
                )
              })}
            </nav>
          </aside>

          <section className="platform-workspace">
            <div className="platform-workspace-head"><div><span>{entry.label}</span><h1>{entry.title}</h1><p>{entry.intro}</p></div><button className="button secondary" onClick={onConnect}><Wallet size={15} />{walletState?.account ? 'Manage wallet' : 'Connect wallet'}</button></div>
            <div className="platform-product-grid"><ToolPanel tool={activeTool} walletState={walletState} onConnect={onConnect} networkKey={platformNetwork} /><aside className="product-context"><span>RABBIT PLATFORM</span><h3>Product interface first. Services only when verified.</h3><p>These screens are the official application surface, but they stay explicit about availability. No market, bridge or contract is presented as live before its release gate is complete.</p><div><ShieldCheck size={17} /><span><b>No seed phrase</b><small>Wallet connection uses the public account only.</small></span></div><div><Network size={17} /><span><b>{platformNetwork === 'mainnet' ? 'Mainnet reserved' : 'Testnet first'}</b><small>{platformNetwork === 'mainnet' ? 'Chain ID 928 follows public Testnet validation.' : 'Chain ID 9280 is the first public application environment.'}</small></span></div><button
      className="button primary"
      disabled={platformNetwork === 'mainnet'}
      onClick={() => platformNetwork === 'testnet' && onAddNetwork?.(selectedNetwork)}
    >
      {platformNetwork === 'mainnet' ? 'Mainnet after Testnet' : 'Add Rabbit Testnet'}
    </button></aside></div>
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
            <div className="hero-ctas"><button className="button primary" onClick={onConnect}><Wallet size={16} />{walletState?.account ? 'Manage wallet' : 'Connect wallet'}</button><button
      className="button secondary"
      disabled={platformNetwork === 'mainnet'}
      onClick={() => platformNetwork === 'testnet' && onAddNetwork?.(selectedNetwork)}
    >
      {platformNetwork === 'mainnet' ? 'Mainnet after Testnet' : 'Add Rabbit Testnet'}
    </button></div>
            <div className="platform-overview-network">
              <span>APPLICATION NETWORK</span>
              <PlatformNetworkSwitch
                value={platformNetwork}
                onChange={selectPlatformNetwork}
              />
            </div>

            <div className="platform-principles"><span><ShieldCheck size={15} />Non-custodial wallet connection</span><span><Network size={15} />Testnet-first product surface</span></div>
          </div>

          <div className="platform-v2-window">
            <div className="platform-v2-window-head"><div><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT PLATFORM</b><small>{networkName.toUpperCase()} WORKSPACE · CHAIN ID {networkChainId}</small></span></div><b>{platformNetwork === 'mainnet' ? 'COMING LATER' : 'PRE-LAUNCH'}</b></div>
            <div className="platform-v2-wallet"><div><span>CONNECTED WALLET</span><strong>{walletState?.account ? `${walletState.account.slice(0, 8)}…${walletState.account.slice(-6)}` : 'Not connected'}</strong></div><button onClick={onConnect}>{walletState?.account ? 'Manage' : 'Connect'}</button></div>
            <div className="platform-v2-module-list">{visibleTools.map((key, index) => { const Icon = tools[key].icon; return <Link to={`/platform/${key}`} key={key}><span>0{index + 1}</span><Icon size={18} /><div><b>{tools[key].title}</b><small>{tools[key].intro}</small></div><em>{platformNetwork === 'mainnet' ? 'COMING LATER' : 'PRE-LAUNCH'}</em><ArrowUpRight size={15} /></Link> })}</div>
          </div>
        </div>
      </section>

      <section className="platform-v2-product">
        <div className="shell platform-v2-product-head"><div><span className="section-kicker">PRODUCT SURFACE</span><h2>Six modules. One coherent interface.</h2></div><p>The Platform is a first-class part of Rabbit, while RabbitChain.org remains the source of truth for network status, releases and documentation.</p></div>
        <div className="shell platform-v2-grid">
          {visibleTools.map((key, index) => { const Icon = tools[key].icon; return <Link to={`/platform/${key}`} key={key}><span>0{index + 1}</span><div><Icon size={21} /><em>{platformNetwork === 'mainnet' ? 'COMING LATER' : 'PRE-LAUNCH'}</em></div><h3>{tools[key].title}</h3><p>{tools[key].intro}</p><b>Open module <ArrowRight size={14} /></b></Link> })}
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
