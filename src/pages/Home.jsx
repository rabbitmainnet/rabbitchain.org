import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Blocks, BookOpen, Braces, CheckCircle2, Code2,
  Cpu, Database, Factory, FileCheck2, FlaskConical, GitBranch, Globe2,
  Layers3, Network, Repeat2, Rocket, ShieldCheck, TerminalSquare, Wallet, Waves,
} from 'lucide-react'
import ProtocolConsole from '../components/ProtocolConsole'
import SectionHeader from '../components/SectionHeader'
import { NETWORKS } from '../config/networks'

const principles = [
  ['01', GitBranch, 'Open participation', 'Valid work can create eligibility. Rabbit is designed without a permanently privileged producer seat.'],
  ['02', Network, 'Protocol coordination', 'LCQ orders eligible participants and resolves the next producer opportunity from protocol state.'],
  ['03', Braces, 'Familiar execution', 'EVM execution keeps contracts, wallets and JSON-RPC workflows familiar to builders.'],
]

const lcqSteps = [
  ['01', 'WORK', 'Generate valid work', 'A participant produces work under the active Rabbit proof rules.'],
  ['02', 'ELIGIBILITY', 'Qualify', 'Protocol state determines whether the wallet can enter producer coordination.'],
  ['03', 'QUEUE', 'Enter LCQ', 'Eligible participants are ordered under deterministic consensus rules.'],
  ['04', 'PRODUCER', 'Produce', 'The selected participant receives the next block-production opportunity.'],
  ['05', 'COMMITTEE', 'Complete', 'Committee participation completes the consensus and reward flow.'],
]

const paths = [
  [Wallet, 'USE', 'Use Rabbit', 'Connect a wallet, add Testnet and reach official network services.', '/testnet'],
  [Cpu, 'MINE', 'Participate', 'Run Rabbit, produce valid work and enter LCQ when eligible.', '/mining'],
  [Database, 'OPERATE', 'Run infrastructure', 'Join P2P and operate an independent Rabbit node or RPC.', '/nodes'],
  [Code2, 'BUILD', 'Build with EVM', 'Use familiar Solidity and Ethereum-style developer tooling.', '/developers'],
]

const platformModules = [
  [Repeat2, 'Swap', 'Trade supported Rabbit-native assets.', '/platform/swap'],
  [Waves, 'Liquidity', 'Create and manage supported liquidity positions.', '/platform/liquidity'],
  [Rocket, 'Launchpool', 'Discover official launch campaigns.', '/platform/launchpool'],
  [Factory, 'Token Factory', 'Deploy standard EVM tokens through a guided flow.', '/platform/factory'],
  [Layers3, 'Bridge', 'Move supported assets when bridge infrastructure is active.', '/platform/bridge'],
  [Wallet, 'Portfolio', 'See connected-wallet network context in one place.', '/platform/portfolio'],
]

export default function Home({ walletState, onConnect, onAddNetwork }) {
  const testnet = NETWORKS.testnet
  return (
    <main>
      <section className="home-hero">
        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <div className="hero-eyebrow"><i /> RABBIT CHAIN · EVM LAYER 1 · LCQ CONSENSUS</div>
            <h1>Fair access to <em>block production.</em></h1>
            <p>Rabbit Chain is a permissionless EVM Layer 1 where valid work creates eligibility and <strong>LCQ coordinates who produces next.</strong></p>
            <div className="hero-manifesto"><span>One wallet</span><i /><span>One fair chance</span></div>
            <div className="hero-ctas">
              <Link className="button primary" to="/testnet">Enter Testnet <ArrowRight size={16} /></Link>
              <Link className="button secondary" to="/platform">Open Platform <ArrowRight size={16} /></Link>
              <Link className="button ghost" to="/lcq">Explore LCQ</Link>
              <button className="button ghost" onClick={onConnect}><Wallet size={16} />{walletState.account ? 'Open wallet' : 'Connect wallet'}</button>
            </div>
            <div className="hero-facts">
              <div><span>TESTNET</span><strong>Chain ID 9280</strong></div>
              <div><span>CONSENSUS</span><strong>LCQ</strong></div>
              <div><span>BLOCK TARGET</span><strong>~10 seconds</strong></div>
              <div><span>REWARD</span><strong>70 / 30</strong></div>
            </div>
          </div>
          <div className="home-hero-console"><ProtocolConsole /></div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="shell proof-strip-grid">
          <div><span>FIRST PUBLIC NETWORK</span><strong>Rabbit Testnet · 9280</strong></div>
          <div><span>PRODUCTION NETWORK</span><strong>Rabbit Mainnet · 928</strong></div>
          <div><span>EXECUTION</span><strong>EVM</strong></div>
          <div><span>NETWORK</span><strong>Permissionless P2P</strong></div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="WHY RABBIT"
          title="Open participation. Protocol-defined coordination."
          text="Rabbit separates useful participation from permanent control of block production. Work can create eligibility; LCQ coordinates the producer opportunity."
        />
        <div className="principle-cards">
          {principles.map(([number, Icon, title, text]) => (
            <article className="principle-card" key={number}>
              <div className="principle-card-top"><span>{number}</span><div><Icon size={20} /></div></div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lcq-feature" id="lcq-overview">
        <div className="shell">
          <SectionHeader
            eyebrow="LIVE CONSENSUS QUEUE"
            title="One visible path from work to the next block."
            text="LCQ makes the block-production path explicit without changing the familiar EVM application surface."
          />
          <div className="lcq-steps">
            {lcqSteps.map(([number, label, title, text], index) => (
              <article className={index === 2 ? 'active' : ''} key={number}>
                <span>{number} · {label}</span><h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
          <div className="reward-panel">
            <div><span>BLOCK REWARD MODEL</span><h3>Two consensus roles. One deterministic split.</h3><p>The block reward model recognizes the producer and committee roles explicitly.</p></div>
            <div className="reward-number producer"><strong>70%</strong><span>PRODUCER</span></div>
            <div className="reward-number committee"><strong>30%</strong><span>COMMITTEE</span></div>
          </div>
          <Link className="inline-link light-link" to="/lcq">Deep dive into LCQ <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="platform-feature">
        <div className="shell platform-feature-grid">
          <div className="platform-copy">
            <span className="section-kicker">RABBIT PLATFORM</span>
            <h2>The application layer should feel as complete as the network.</h2>
            <p>Rabbit Platform brings wallet-connected network utilities into one official product surface — Swap, Liquidity, Launchpool, Token Factory, Bridge and Portfolio.</p>
            <div className="platform-status-line"><i /><span>Product interface ready · network services activate deliberately</span></div>
            <div className="hero-ctas">
              <Link className="button primary" to="/platform">Open Rabbit Platform <ArrowRight size={15} /></Link>
              <button className="button secondary" onClick={onConnect}><Wallet size={15} /> {walletState.account ? 'Manage wallet' : 'Connect wallet'}</button>
            </div>
          </div>

          <div className="platform-preview">
            <aside>
              <div className="platform-preview-brand"><img src="/rabbit-mark.png" alt="" /><b>RABBIT</b></div>
              <span className="active">Overview</span><span>Swap</span><span>Liquidity</span><span>Launchpool</span><span>Token Factory</span><span>Bridge</span><span>Portfolio</span>
            </aside>
            <div className="platform-preview-main">
              <div className="platform-preview-head"><div><small>RABBIT PLATFORM</small><strong>Testnet workspace</strong></div><button onClick={onConnect}>{walletState.account ? `${walletState.account.slice(0, 6)}…${walletState.account.slice(-4)}` : 'Connect wallet'}</button></div>
              <div className="platform-preview-wallet"><span>CONNECTED WALLET</span><strong>{walletState.account ? 'Wallet connected' : 'Not connected'}</strong><p>Network context, assets and application actions appear here.</p></div>
              <div className="platform-preview-grid">
                {platformModules.map(([Icon, title, text]) => (
                  <div key={title}><Icon size={18} /><span>PRE-LAUNCH</span><strong>{title}</strong><p>{text}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="shell platform-module-links">
          {platformModules.map(([Icon, title, text, to]) => (
            <Link to={to} key={title}><Icon size={18} /><span><b>{title}</b><small>{text}</small></span><ArrowUpRight size={15} /></Link>
          ))}
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="CHOOSE YOUR PATH"
          title="Use, mine, operate or build."
          text="A serious network portal should get every visitor to the right workflow in one or two clicks."
        />
        <div className="path-grid">
          {paths.map(([Icon, label, title, text, to]) => (
            <Link className="path-card" to={to} key={label}>
              <div className="path-card-icon"><Icon size={21} /></div><span>{label}</span><h3>{title}</h3><p>{text}</p><b>Open path <ArrowUpRight size={14} /></b>
            </Link>
          ))}
        </div>
      </section>

      <section className="testnet-launch">
        <div className="shell testnet-launch-grid">
          <div className="testnet-launch-copy">
            <span className="section-kicker">RABBIT TESTNET · CHAIN ID 9280</span>
            <h2>Public launch status without guessing.</h2>
            <p>Wallet connection is already functional. RPC, explorer, faucet and public binaries remain clearly marked until they are intentionally activated.</p>
            <div className="hero-ctas"><Link className="button primary" to="/testnet">Testnet hub <ArrowRight size={15} /></Link><Link className="button secondary" to="/status">Network status</Link></div>
          </div>
          <div className="readiness-grid">
            <article><Wallet size={18} /><span>WALLET</span><strong>Connect</strong><b className="ready">LIVE</b></article>
            <article><Network size={18} /><span>NETWORK</span><strong>Chain ID 9280</strong><b className="ready">CONFIGURED</b></article>
            <article><TerminalSquare size={18} /><span>RPC</span><strong>Official endpoint</strong><b>{testnet.publicRpcReady ? 'LIVE' : 'RESERVED'}</b></article>
            <article><Globe2 size={18} /><span>EXPLORER</span><strong>Block explorer</strong><b>{testnet.publicExplorerReady ? 'LIVE' : 'RESERVED'}</b></article>
            <article><FlaskConical size={18} /><span>FAUCET</span><strong>RAB / RUSD</strong><b>{testnet.publicFaucetReady ? 'LIVE' : 'RESERVED'}</b></article>
            <article><Cpu size={18} /><span>MINING</span><strong>Public binaries</strong><b>RELEASE GATE</b></article>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="OFFICIAL RESOURCES"
          title="Everything verifiable, from one domain."
          text="Documentation, source code, releases and security guidance should be easy to verify before the public network carries real value."
        />
        <div className="resource-grid">
          <Link to="/docs"><BookOpen size={22} /><span>DOCUMENTATION</span><h3>Protocol & network docs</h3><p>Network configuration, LCQ, wallets, JSON-RPC and operator references.</p><b>Read docs <ArrowRight size={14} /></b></Link>
          <a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer"><Code2 size={22} /><span>OPEN SOURCE</span><h3>Official GitHub</h3><p>Source code, releases and public project history.</p><b>Open GitHub <ArrowUpRight size={14} /></b></a>
          <Link to="/security"><ShieldCheck size={22} /><span>SECURITY</span><h3>Verify before you trust</h3><p>Official domains, wallet safety and release verification guidance.</p><b>Security center <ArrowRight size={14} /></b></Link>
          <Link to="/releases"><FileCheck2 size={22} /><span>RELEASES</span><h3>Official binaries</h3><p>Windows, Linux and macOS release tracks with hashes when public.</p><b>Release center <ArrowRight size={14} /></b></Link>
        </div>
      </section>

      <section className="final-banner">
        <div className="shell final-banner-inner">
          <div><img src="/rabbit-mark.png" alt="Rabbit Chain" /><span>RABBIT CHAIN</span></div>
          <h2>One wallet. <em>One fair chance.</em></h2>
          <p>Testnet first. Mainnet after public validation.</p>
          <div className="hero-ctas"><button className="button light" onClick={() => onAddNetwork(testnet)}>Add Rabbit Testnet</button><Link className="button dark-outline" to="/platform">Explore Platform <ArrowRight size={15} /></Link></div>
        </div>
      </section>
    </main>
  )
}
