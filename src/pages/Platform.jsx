import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Coins, Droplets, Factory, Flame, Layers3, Network,
  Repeat2, Rocket, ShieldCheck, Wallet, Waves,
} from 'lucide-react'
import { NETWORKS } from '../config/networks'
import { PLATFORM_NETWORKS, platformModuleStatus } from '../config/platform'
import { usePlatformNetwork } from '../hooks/usePlatformNetwork'
import PlatformNetworkSwitch from '../components/PlatformNetworkSwitch'
import RabbitSwapPanel from '../components/RabbitSwapPanel'
import RabbitFaucetPanel from '../components/RabbitFaucetPanel'
import RabbitLiquidityPanel from '../components/RabbitLiquidityPanel'
import RabbitTokenFactoryPanel from '../components/RabbitTokenFactoryPanel'

const tools = {
  swap: { icon: Repeat2, label: 'SWAP', title: 'Rabbit Swap', intro: 'Trade Rabbit Testnet assets through the verified RabbitSwap Router and live liquidity pools.' },
  liquidity: { icon: Waves, label: 'LIQUIDITY', title: 'Liquidity', intro: 'Create and manage RabbitSwap liquidity positions. Permissionless pairs are supported by the Testnet contracts.' },
  launchpool: { icon: Flame, label: 'LAUNCHPOOL', title: 'Launchpool', intro: 'Discover official launch campaigns and participation windows in one place.' },
  factory: { icon: Factory, label: 'TOKEN FACTORY', title: 'Token Factory', intro: 'Create fixed-supply Rabbit Testnet ERC-20 tokens with transparent rules and TWAP-priced fees.' },
  bridge: { icon: Layers3, label: 'BRIDGE', title: 'Bridge', intro: 'Move supported assets through official routes when bridge infrastructure is available.' },
  staking: { icon: Coins, label: 'STAKING', title: 'Staking', intro: 'Stake supported Rabbit assets through the official non-custodial application interface when staking contracts are released.' },
  p2p: { icon: Network, label: 'P2P', title: 'P2P', intro: 'Direct peer-to-peer interaction through the Rabbit application layer when the public service is released.' },
  faucet: {
    icon: Droplets,
    label: 'FAUCET',
    title: 'Faucet',
    intro: 'Participant faucet for miners, builders and testers. Mine tRAB first, then use test assets to keep testing Rabbit Testnet.'
  },
}

const toolOrder = ['swap', 'liquidity', 'staking', 'bridge', 'p2p', 'launchpool', 'factory', 'faucet']


function ToolPanel({ tool, walletState, walletProvider, onConnect, onSwitchNetwork, networkKey, toast }) {
  const entry = tools[tool]
  const Icon = entry.icon
  const network = PLATFORM_NETWORKS[networkKey] || PLATFORM_NETWORKS.testnet
  const statusText = platformModuleStatus(networkKey, tool)

  if (tool === 'swap') {
    return (
      <RabbitSwapPanel
        key={`rabbit-swap-${networkKey}`}
        networkKey={networkKey}
        walletState={walletState}
        walletProvider={walletProvider}
        onConnect={onConnect}
        onSwitchNetwork={onSwitchNetwork}
        toast={toast}
        variant="platform"
      />
    )
  }

  if (tool === 'liquidity') {
    if (networkKey === 'testnet' && network.modules?.liquidityLive) {
      return (
        <RabbitLiquidityPanel
          walletState={walletState}
          walletProvider={walletProvider}
          onConnect={onConnect}
          onSwitchNetwork={onSwitchNetwork}
          toast={toast}
        />
      )
    }

    return (
      <div className="product-panel">
        <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{statusText}</b></div>
        <div className="product-empty"><Waves size={34} /><h3>No public pools yet.</h3><p>Official {network.name} markets will appear here after contracts and liquidity are activated for this network.</p><button onClick={onConnect}>{walletState?.account ? 'Wallet connected' : 'Connect wallet'}</button></div>
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
    if (networkKey === 'testnet' && network.modules?.factoryLive) {
      return (
        <RabbitTokenFactoryPanel
          walletState={walletState}
          walletProvider={walletProvider}
          onConnect={onConnect}
          onSwitchNetwork={onSwitchNetwork}
          toast={toast}
        />
      )
    }

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
        <div className="bridge-route"><div><span>FROM</span><strong>External network</strong><small>Official route not published</small></div><ArrowRight size={20} /><div><span>TO</span><strong>{network.name}</strong><small>Chain ID {network.chainId}</small></div></div>
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
          <h3>P2P is not public on {network.name} yet.</h3>
          <p>
            The peer-to-peer application will appear here only after this network's
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
            <strong>{network.name}</strong>
            <small>Chain ID {network.chainId}</small>
          </div>

          <div>
            <span>STATUS</span>
            <strong>{statusText === 'LIVE' ? 'Live' : statusText === 'COMING LATER' ? 'Coming later' : 'Pre-launch'}</strong>
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
      <RabbitFaucetPanel
        walletState={walletState}
        walletProvider={walletProvider}
        onConnect={onConnect}
        onSwitchNetwork={onSwitchNetwork}
        toast={toast}
      />
    )
  }

  return (
    <div className="product-panel">
      <div className="product-panel-title"><div><Icon size={20} /><span>{entry.label}</span></div><b>{statusText}</b></div>
      <div className="product-empty"><h3>Module not available yet.</h3><p>This Rabbit Platform module will activate only after its public release gate is complete.</p></div>
    </div>
  )
}

export default function Platform({ walletState, walletProvider, onConnect, onAddNetwork, toast }) {
  const { tool } = useParams()
  const activeTool = tools[tool] ? tool : null
  const navigate = useNavigate()

  const {
    platformNetwork,
    setPlatformNetwork,
    network: platformConfig,
  } = usePlatformNetwork()

  const selectedNetwork = NETWORKS[platformNetwork]

  const visibleTools = toolOrder.filter((key) => {
    if (key === 'faucet' && !platformConfig.showFaucet) return false
    if (key === 'bridge' && platformNetwork === 'testnet') return false
    if (platformNetwork === 'testnet' && (key === 'staking' || key === 'p2p')) return false
    return true
  })

  const networkName = platformConfig.name
  const networkChainId = platformConfig.chainId

  useEffect(() => {
    const faucetUnavailable = tool === 'faucet' && !platformConfig.showFaucet
    const bridgeUnavailable = tool === 'bridge' && platformNetwork === 'testnet'
    const deferredOnTestnet = platformNetwork === 'testnet' && (tool === 'staking' || tool === 'p2p')
    if (faucetUnavailable || bridgeUnavailable || deferredOnTestnet) navigate('/platform/swap', { replace: true })
  }, [tool, platformConfig.showFaucet, platformNetwork, navigate])

  function selectPlatformNetwork(key) {
    setPlatformNetwork(key)

    const faucetUnavailable = !PLATFORM_NETWORKS[key]?.showFaucet && activeTool === 'faucet'
    const bridgeUnavailable = key === 'testnet' && activeTool === 'bridge'
    const deferredOnTestnet = key === 'testnet' && (activeTool === 'staking' || activeTool === 'p2p')
    if (faucetUnavailable || bridgeUnavailable || deferredOnTestnet) navigate('/platform/swap')
  }

  if ((activeTool === 'faucet' && !platformConfig.showFaucet) || (activeTool === 'bridge' && platformNetwork === 'testnet') || (platformNetwork === 'testnet' && (activeTool === 'staking' || activeTool === 'p2p'))) return null

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

          <section className={`platform-workspace${platformNetwork === 'testnet' ? ' platform-workspace-testnet' : ''}`}>
            <div className="platform-workspace-head"><div><span>{entry.label}</span><h1>{entry.title}</h1><p>{entry.intro}</p></div><div className="platform-workspace-actions">{platformNetwork === 'testnet' && selectedNetwork?.walletEnabled && <button className="platform-testnet-network-button" type="button" onClick={() => onAddNetwork?.(selectedNetwork)}>Add / switch Testnet</button>}<button className="button secondary" onClick={onConnect}><Wallet size={15} />{walletState?.account ? 'Manage wallet' : 'Connect wallet'}</button></div></div>
            <div className={`platform-product-grid${platformNetwork === 'testnet' ? ' platform-product-grid-testnet' : ''}`}><ToolPanel tool={activeTool} walletState={walletState} walletProvider={walletProvider} onConnect={onConnect} onSwitchNetwork={onAddNetwork} networkKey={platformNetwork} toast={toast} />{platformNetwork !== 'testnet' && <aside className="product-context"><span>RABBIT PLATFORM</span><h3>Product interface first. Services only when verified.</h3><p>These screens are the official application surface, but they stay explicit about availability. No module or contract is presented as live before its release gate is complete.</p><div><ShieldCheck size={17} /><span><b>No seed phrase</b><small>Wallet connection uses the public account only.</small></span></div><div><Network size={17} /><span><b>{networkName}</b><small>Chain ID {networkChainId} · {platformConfig.status}</small></span></div><button
      className="button primary"
      disabled={!selectedNetwork?.walletEnabled}
      onClick={() => selectedNetwork?.walletEnabled && onAddNetwork?.(selectedNetwork)}
    >
      {selectedNetwork?.walletEnabled ? `Add / switch ${selectedNetwork.shortName}` : `${selectedNetwork.shortName} coming later`}
    </button></aside>}</div>
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
            <p>{platformNetwork === 'testnet' ? 'Wallet, swaps, liquidity, launches and token creation organized as one Testnet workspace — focused on the services available for public Testnet validation.' : 'Wallet, swaps, liquidity, staking, bridging, P2P, launches and token creation organized as one product — with every module showing its real launch state.'}</p>
            <div className="hero-ctas"><button className="button primary" onClick={onConnect}><Wallet size={16} />{walletState?.account ? 'Manage wallet' : 'Connect wallet'}</button><button
      className="button secondary"
      disabled={!selectedNetwork?.walletEnabled}
      onClick={() => selectedNetwork?.walletEnabled && onAddNetwork?.(selectedNetwork)}
    >
      {selectedNetwork?.walletEnabled ? `Add / switch ${selectedNetwork.shortName}` : `${selectedNetwork.shortName} coming later`}
    </button></div>
            <div className="platform-overview-network">
              <span>APPLICATION NETWORK</span>
              <PlatformNetworkSwitch
                value={platformNetwork}
                onChange={selectPlatformNetwork}
              />
            </div>

            <div className="platform-principles"><span><ShieldCheck size={15} />Non-custodial wallet connection</span><span><Network size={15} />{networkName} selected</span></div>
          </div>

          <div className="platform-v2-window">
            <div className="platform-v2-window-head"><div><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT PLATFORM</b><small>{networkName.toUpperCase()} WORKSPACE · CHAIN ID {networkChainId}</small></span></div><b>{platformConfig.status}</b></div>
            <div className="platform-v2-wallet"><div><span>CONNECTED WALLET</span><strong>{walletState?.account ? `${walletState.account.slice(0, 8)}…${walletState.account.slice(-6)}` : 'Not connected'}</strong></div><button onClick={onConnect}>{walletState?.account ? 'Manage' : 'Connect'}</button></div>
            <div className="platform-v2-module-list">{visibleTools.map((key, index) => { const Icon = tools[key].icon; return <Link to={`/platform/${key}`} key={key}><span>0{index + 1}</span><Icon size={18} /><div><b>{tools[key].title}</b><small>{tools[key].intro}</small></div><em>{platformModuleStatus(platformNetwork, key)}</em><ArrowUpRight size={15} /></Link> })}</div>
          </div>
        </div>
      </section>

      <section className="platform-v2-product">
        <div className="shell platform-v2-product-head"><div><span className="section-kicker">PRODUCT SURFACE</span><h2>One product surface. Every module in one place.</h2></div><p>The Platform is a first-class part of Rabbit, while RabbitChain.org remains the source of truth for network status, releases and documentation.</p></div>
        <div className="shell platform-v2-grid">
          {visibleTools.map((key, index) => { const Icon = tools[key].icon; return <Link to={`/platform/${key}`} key={key}><span>0{index + 1}</span><div><Icon size={21} /><em>{platformModuleStatus(platformNetwork, key)}</em></div><h3>{tools[key].title}</h3><p>{tools[key].intro}</p><b>Open module <ArrowRight size={14} /></b></Link> })}
        </div>
      </section>

      <section className="platform-v2-stack">
        <div className="shell platform-v2-stack-grid">
          <div><span className="section-kicker">THE RABBIT STACK</span><h2>Applications above. Protocol below.</h2><p>Rabbit Platform uses the same wallet, RPC, EVM, LCQ and P2P surfaces documented across RabbitChain.org.</p><Link className="inline-link light-link" to="/lcq">Understand LCQ <ArrowRight size={14} /></Link></div>
          <div className="platform-v2-stack-rail"><div><small>05</small><span>APPLICATIONS</span><strong>{platformNetwork === 'testnet' ? 'Swap · Liquidity · Launchpool · Factory' : 'Swap · Liquidity · Staking · Bridge · P2P · Launchpool · Factory'}</strong></div><i /><div><small>04</small><span>WALLET & RPC</span><strong>EVM wallet · WalletConnect · JSON-RPC</strong></div><i /><div><small>03</small><span>EXECUTION</span><strong>EVM · transactions · smart contracts</strong></div><i /><div className="accent"><small>02</small><span>CONSENSUS</span><strong>LCQ · producer · committee</strong></div><i /><div><small>01</small><span>NETWORK</span><strong>P2P · nodes · mining</strong></div></div>
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
