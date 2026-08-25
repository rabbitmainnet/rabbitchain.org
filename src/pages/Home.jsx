import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, Blocks, Code2, Cpu, FileText, FlaskConical, Globe2, Layers3, Network, Radio, Repeat2, ShieldCheck, TerminalSquare, Wallet } from 'lucide-react'
import NetworkHero from '../components/NetworkHero'
import SectionHeader from '../components/SectionHeader'
import LaunchAction from '../components/LaunchAction'

const lcqFlow = [
  ['01','WORK','A Rabbit node produces valid work under protocol rules.'],
  ['02','ELIGIBILITY','The protocol determines eligibility for producer coordination.'],
  ['03','QUEUE','LCQ orders eligible participants deterministically.'],
  ['04','PRODUCER','The selected participant receives the next block opportunity.'],
  ['05','COMMITTEE','Committee participation completes the consensus flow.']
]

const paths = [
  { icon: Wallet, label:'USE', title:'Use Rabbit', text:'Connect a wallet and reach the network, explorer, faucet and application layer.', to:'/platform' },
  { icon: Cpu, label:'MINE', title:'Participate in LCQ', text:'Run Rabbit, generate valid work and compete for producer opportunities.', to:'/mining' },
  { icon: Network, label:'OPERATE', title:'Run infrastructure', text:'Join P2P, sync the chain and operate independent Rabbit infrastructure.', to:'/nodes' },
  { icon: Code2, label:'BUILD', title:'Build with EVM', text:'Use familiar Ethereum execution tooling while Rabbit handles consensus underneath.', to:'/developers' }
]

export default function Home({ walletState, onConnect }){
  return <main>
    <section className="home-hero shell">
      <div className="home-hero-copy">
        <div className="hero-badge"><span>RABBIT CHAIN · LAYER 1 · LCQ CONSENSUS</span></div>
        <h1>One wallet.<br/><em>One fair chance.</em></h1>
        <p>Rabbit Chain is a permissionless EVM Layer 1 powered by <strong>LCQ Consensus</strong>, built to open block-production opportunity through protocol-defined coordination.</p>
        <div className="hero-ctas"><Link className="button primary" to="/platform">Explore Rabbit <ArrowRight size={16}/></Link><Link className="button secondary" to="/lcq">LCQ Consensus</Link><button className="button ghost" onClick={onConnect}><Wallet size={16}/>{walletState.account?'Open wallet':'Connect wallet'}</button></div>
        <div className="hero-principle"><span>NETWORK PATH</span><strong>Testnet 9280 launches first · Mainnet 928 follows validation.</strong></div>
      </div>
      <div className="home-hero-visual"><NetworkHero/></div>
    </section>

    <section className="protocol-rail"><div className="shell protocol-rail-inner"><div><span>TESTNET</span><strong>9280</strong></div><div><span>MAINNET</span><strong>928</strong></div><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>BLOCK TARGET</span><strong>~10s</strong></div><div><span>NETWORK</span><strong>P2P</strong></div></div></section>

    <section className="home-entry shell">
      <div className="home-entry-head"><span>START HERE</span><h2>Choose what you want to do.</h2><p>The fastest route into Rabbit should depend on the visitor — use the network, mine, operate infrastructure or build.</p></div>
      <div className="path-grid">{paths.map(({icon:Icon,label,title,text,to})=><Link className="path-card" to={to} key={label}><div className="path-icon"><Icon size={23}/></div><span>{label}</span><h3>{title}</h3><p>{text}</p><b>Open <ArrowUpRight size={15}/></b></Link>)}</div>
    </section>

    <section className="principle-section"><div className="shell principle-grid"><div className="principle-number">01</div><div className="principle-copy"><span>WHY RABBIT</span><h2>Block-production opportunity should be <em>coordinated by protocol.</em></h2></div><div className="principle-text"><p>Rabbit is designed around a simple idea: valid participation creates an opportunity, while LCQ coordinates eligible wallets under deterministic consensus rules.</p><Link to="/lcq">Understand LCQ <ArrowUpRight size={15}/></Link></div></div></section>

    <section className="lcq-home shell"><SectionHeader eyebrow="LIVE CONSENSUS QUEUE" title="From work to the next block, in one visible flow." text="Rabbit keeps the execution layer familiar while moving its core differentiation into consensus: work, eligibility, queue position, producer selection and committee participation."/><div className="lcq-flow-grid">{lcqFlow.map(([n,title,text],i)=><article className="lcq-flow-card" key={n}><div className="lcq-flow-top"><span>{n}</span>{i<lcqFlow.length-1&&<i/>}</div><strong>{title}</strong><p>{text}</p></article>)}</div><div className="reward-model" id="rewards"><div className="reward-copy"><span>BLOCK REWARD MODEL</span><h3>Two consensus roles. One protocol-defined split.</h3><p>Producer and committee economics remain visible and deterministic.</p></div><div className="reward-bars"><div className="reward-producer"><strong>70%</strong><span>PRODUCER</span></div><div className="reward-committee"><strong>30%</strong><span>COMMITTEE</span></div></div></div></section>

    <section className="platform-home">
      <div className="shell platform-home-grid"><div className="platform-home-copy"><span>RABBIT PLATFORM</span><h2>The network is infrastructure.<br/><em>The platform is where users act.</em></h2><p>Keep protocol information and applications connected but clearly separated. Rabbit Platform becomes the wallet-connected hub for trading, launching, creating and moving assets.</p><div className="platform-home-actions"><Link className="button primary" to="/platform">Open Platform <ArrowRight size={15}/></Link><button className="button secondary" onClick={onConnect}><Wallet size={15}/> Connect wallet</button></div></div><div className="platform-home-modules"><Link to="/platform"><Repeat2/><span>SWAP</span><strong>Trade assets</strong></Link><Link to="/platform"><Layers3/><span>LAUNCHPOOL</span><strong>Discover launches</strong></Link><Link to="/platform"><Blocks/><span>FACTORY</span><strong>Create tokens</strong></Link><Link to="/platform"><Globe2/><span>BRIDGE</span><strong>Move assets</strong></Link></div></div>
    </section>

    <section className="launch-center-section shell"><div className="launch-center-head"><div><span>RABBIT TESTNET · CHAIN ID 9280</span><h2>The first public network.</h2></div><p>Wallet, faucet, explorer, RPC, mining and node access belong in one network hub — not scattered across the site.</p></div><div className="launch-grid"><LaunchAction icon={Wallet} label="WALLET" title="Connect wallet" text="Connect an installed EVM wallet without signing or giving custody." to="/testnet#wallet"/><LaunchAction icon={FlaskConical} label="FAUCET" title="Get network assets" text="RAB and RUSD faucet access will be available through the Testnet hub." disabled badge="COMING SOON"/><LaunchAction icon={Globe2} label="EXPLORER" title="Inspect the chain" text="Blocks, transactions, addresses and contracts through the official explorer." disabled badge="COMING SOON"/><LaunchAction icon={Radio} label="RPC" title="Connect applications" text="Official JSON-RPC and WebSocket network configuration." to="/developers#networks"/><LaunchAction icon={Cpu} label="MINING" title="Start mining" text="Download Rabbit, verify releases and participate through LCQ." to="/mining"/><LaunchAction icon={Network} label="NODE" title="Run a node" text="Operate independent P2P infrastructure and help propagate Rabbit." to="/nodes"/></div></section>

    <section className="developer-home"><div className="shell developer-home-grid"><div className="developer-home-copy"><span>BUILD ON RABBIT</span><h2>Familiar EVM execution.<br/><em>LCQ underneath.</em></h2><p>Developers get network parameters, JSON-RPC, smart-contract guidance and node interfaces in one place.</p><div><Link className="button light" to="/developers">Developer portal <ArrowRight size={15}/></Link><Link className="button dark-outline" to="/docs">Read docs</Link></div></div><div className="developer-code"><div className="code-head"><span>rabbit.network.ts</span><small>NETWORKS</small></div><pre><code><span>export const</span> rabbit = {'{'}{`\n`}  testnet: {'{'} chainId: <b>9280</b>, asset: <em>'RAB'</em> {'}'},{`\n`}  mainnet: {'{'} chainId: <b>928</b>, asset: <em>'RAB'</em> {'}'},{`\n\n`}  consensus: <em>'LCQ'</em>,{`\n`}  execution: <em>'EVM'</em>{`\n`}{'}'}</code></pre><div className="code-tags"><span><TerminalSquare size={14}/> JSON-RPC</span><span><Blocks size={14}/> Solidity</span><span><ShieldCheck size={14}/> Open source</span></div></div></div></section>

    <section className="roadmap-home shell"><div className="roadmap-copy"><span>NETWORK EVOLUTION</span><h2>Testnet first.<br/><em>Mainnet after public validation.</em></h2><p>Rabbit Testnet is the first public network. Rabbit Mainnet is the production network that follows after protocol, infrastructure and tooling validation.</p><Link className="text-link" to="/mainnet">Mainnet path <ArrowRight size={15}/></Link></div><div className="roadmap-steps"><article className="roadmap-step active"><span>01</span><div><small>FIRST NETWORK</small><h3>Rabbit Testnet</h3><p>Wallets, nodes, mining, RPC, explorer, faucet and applications.</p></div></article><article className="roadmap-step"><span>02</span><div><small>PUBLIC VALIDATION</small><h3>Network hardening</h3><p>Protocol and infrastructure are exercised under public operation.</p></div></article><article className="roadmap-step"><span>03</span><div><small>PRODUCTION</small><h3>Rabbit Mainnet</h3><p>Chain ID 928 becomes the production Rabbit network.</p></div></article></div></section>

    <section className="resources-home shell"><SectionHeader eyebrow="PROTOCOL RESOURCES" title="Everything official, in one place." text="The website should end with verifiable protocol resources — documentation, source code, releases and the Whitepaper location."/><div className="resource-grid"><Link to="/whitepaper"><FileText/><h3>Whitepaper</h3><p>Official protocol paper location, ready for publication when the document is finalized.</p></Link><Link to="/docs"><BookOpen/><h3>Documentation</h3><p>Network architecture, guides, parameters and technical references.</p></Link><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer"><Code2/><h3>GitHub</h3><p>Official source code, website history and public development repositories.</p></a></div></section>

    <section className="final-cta"><div className="final-cta-glow"/><div className="shell final-cta-inner"><img src="/rabbit-mark.png" alt="Rabbit Chain"/><span>RABBIT CHAIN</span><h2>One network ecosystem.<br/><em>Built to be explored.</em></h2><p>Use the platform, understand LCQ, run Rabbit or start building.</p><div><Link className="button light" to="/platform">Explore Platform <ArrowRight size={15}/></Link><Link className="button dark-outline" to="/lcq">Understand LCQ</Link></div></div></section>
  </main>
}
