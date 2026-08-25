import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Blocks, Code2, Cpu, Download, FlaskConical, Gauge, Globe2, Network, Radio, ShieldCheck, TerminalSquare, Wallet, Zap } from 'lucide-react'
import NetworkHero from '../components/NetworkHero'
import SectionHeader from '../components/SectionHeader'
import LaunchAction from '../components/LaunchAction'
import StatusDot from '../components/StatusDot'

const lcqFlow = [
  ['01','WORK','A node produces valid work under the protocol rules.'],
  ['02','ELIGIBILITY','Rabbit determines whether the wallet is eligible to enter producer coordination.'],
  ['03','QUEUE','LCQ organizes eligible participants into a deterministic live queue.'],
  ['04','PRODUCE','The selected participant receives the next block-production opportunity.'],
  ['05','COMMITTEE','Committee participation completes verification and shares protocol rewards.']
]

const paths = [
  { icon: Wallet, label:'USER', title:'Connect & explore', text:'Connect an EVM wallet, inspect the Rabbit network and use Testnet services when they open.', to:'/testnet' },
  { icon: Cpu, label:'MINER', title:'Participate in LCQ', text:'Run the Rabbit client, generate valid work and compete for fair producer opportunities.', to:'/mining' },
  { icon: Network, label:'NODE OPERATOR', title:'Run infrastructure', text:'Join P2P, sync the chain and operate independent network infrastructure.', to:'/nodes' },
  { icon: Code2, label:'DEVELOPER', title:'Build with EVM', text:'Use familiar Ethereum execution tooling while Rabbit handles consensus underneath.', to:'/developers' }
]

export default function Home({ walletState, onConnect }){
  return <>
    <main>
      <section className="home-hero shell">
        <div className="home-hero-copy">
          <div className="hero-badge"><StatusDot tone="launch">PUBLIC TESTNET COMES FIRST</StatusDot><span>Chain ID 9280</span></div>
          <h1>A fair chance to produce the <em>next block.</em></h1>
          <p>Rabbit Chain is a permissionless EVM Layer 1 powered by <strong>LCQ Consensus</strong> — a protocol built around open participation and deterministic block-producer coordination.</p>
          <div className="hero-ctas"><Link className="button primary" to="/testnet">Explore Testnet <ArrowRight size={16}/></Link><Link className="button secondary" to="/lcq">Discover LCQ</Link><button className="button ghost" onClick={onConnect}><Wallet size={16}/>{walletState.account?'Open wallet':'Connect wallet'}</button></div>
          <div className="hero-principle"><span>THE RABBIT PRINCIPLE</span><strong>One wallet. One fair chance.</strong></div>
        </div>
        <div className="home-hero-visual"><NetworkHero/></div>
      </section>

      <section className="protocol-rail"><div className="shell protocol-rail-inner"><div><span>FIRST PUBLIC NETWORK</span><strong>Testnet · 9280</strong></div><div><span>PRODUCTION NETWORK</span><strong>Mainnet · 928</strong></div><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>BLOCK TARGET</span><strong>~10s</strong></div><div><span>NETWORK</span><strong>P2P</strong></div></div></section>

      <section className="launch-center-section shell">
        <div className="launch-center-head"><div><span>TESTNET LAUNCH CENTER</span><h2>The first place to use Rabbit.</h2></div><p>The public Testnet is the first release path. Everything users need — wallet, faucet, explorer, RPC, mining and node guides — lives in one hub.</p></div>
        <div className="launch-grid">
          <LaunchAction icon={Wallet} label="WALLET" title="Connect wallet" text="Connect an installed EVM wallet without signing or giving custody." to="/testnet#wallet" />
          <LaunchAction icon={FlaskConical} label="FAUCET" title="Get test assets" text="RAB and RUSD faucet access will open with the public Testnet." disabled badge="AT LAUNCH" />
          <LaunchAction icon={Globe2} label="EXPLORER" title="Inspect the chain" text="Blocks, transactions, addresses and contracts through the official explorer." disabled badge="RESERVED" />
          <LaunchAction icon={Radio} label="RPC" title="Connect applications" text="Official JSON-RPC and WebSocket endpoints prepared for the public network." to="/developers#networks" />
          <LaunchAction icon={Cpu} label="MINING" title="Start mining" text="Download Rabbit, verify the release and participate through LCQ." to="/mining" />
          <LaunchAction icon={Network} label="NODE" title="Run a node" text="Operate independent P2P infrastructure and help propagate the network." to="/nodes" />
        </div>
      </section>

      <section className="principle-section">
        <div className="shell principle-grid"><div className="principle-number">01</div><div className="principle-copy"><span>WHY RABBIT</span><h2>Consensus should decide <em>who gets the opportunity</em> — not permanent size.</h2></div><div className="principle-text"><p>Rabbit is designed around a simple idea: valid participation should create an opportunity to produce blocks, while LCQ coordinates eligible wallets under protocol rules.</p><Link to="/lcq">Read the LCQ architecture <ArrowUpRight size={15}/></Link></div></div>
      </section>

      <section className="lcq-home shell">
        <SectionHeader eyebrow="LIVE CONSENSUS QUEUE" title="From work to block production, in one visible flow." text="Rabbit keeps the execution layer familiar while moving its differentiation into consensus: work, eligibility, queue position, producer selection and committee participation." />
        <div className="lcq-flow-grid">{lcqFlow.map(([n,title,text],i)=><article className="lcq-flow-card" key={n}><div className="lcq-flow-top"><span>{n}</span>{i<lcqFlow.length-1&&<i/>}</div><strong>{title}</strong><p>{text}</p></article>)}</div>
        <div className="reward-model" id="rewards"><div className="reward-copy"><span>BLOCK REWARD MODEL</span><h3>Producer and committee share every block.</h3><p>The reward split is protocol-defined, making the roles visible instead of burying economics behind a dashboard.</p></div><div className="reward-bars"><div className="reward-producer"><strong>70%</strong><span>PRODUCER</span></div><div className="reward-committee"><strong>30%</strong><span>COMMITTEE</span></div></div></div>
      </section>

      <section className="path-section">
        <div className="shell"><SectionHeader eyebrow="CHOOSE YOUR PATH" title="One network. Different ways to participate." text="The site is organized around what a visitor actually wants to do — not around internal project folders." />
          <div className="path-grid">{paths.map(({icon:Icon,label,title,text,to})=><Link className="path-card" to={to} key={label}><div className="path-icon"><Icon size={23}/></div><span>{label}</span><h3>{title}</h3><p>{text}</p><b>Open path <ArrowUpRight size={15}/></b></Link>)}</div>
        </div>
      </section>

      <section className="roadmap-home shell">
        <div className="roadmap-copy"><span>TESTNET → MAINNET</span><h2>Launch in public.<br/>Prove the network.<br/><em>Then ship Mainnet.</em></h2><p>Testnet is first because the protocol, mining workflow, node operations, RPC, explorer, wallet integrations and developer tooling should be exercised publicly before the production network opens.</p><Link className="text-link" to="/mainnet">See the Mainnet launch path <ArrowRight size={15}/></Link></div>
        <div className="roadmap-steps"><article className="roadmap-step active"><span>01</span><div><small>FIRST</small><h3>Public Testnet</h3><p>Mining, nodes, wallets, RPC, explorer, faucet and applications.</p></div><StatusDot tone="launch">NEXT PUBLIC RELEASE</StatusDot></article><article className="roadmap-step"><span>02</span><div><small>VALIDATE</small><h3>Network hardening</h3><p>Public operation, failure testing, release gates and protocol validation.</p></div><StatusDot>VALIDATION TRACK</StatusDot></article><article className="roadmap-step"><span>03</span><div><small>PRODUCTION</small><h3>Rabbit Mainnet</h3><p>Chain ID 928 becomes the production Rabbit network after Testnet gates pass.</p></div><StatusDot tone="future">AFTER TESTNET</StatusDot></article></div>
      </section>

      <section className="developer-home">
        <div className="shell developer-home-grid"><div className="developer-home-copy"><span>BUILD ON RABBIT</span><h2>Familiar EVM execution.<br/><em>Different consensus underneath.</em></h2><p>Developers should not need to relearn the application layer to explore Rabbit. The developer portal keeps network configuration, JSON-RPC, smart contracts and node interfaces together.</p><div><Link className="button light" to="/developers">Developer portal <ArrowRight size={15}/></Link><Link className="button dark-outline" to="/docs">Read docs</Link></div></div><div className="developer-code"><div className="code-head"><span>rabbit.network.ts</span><small>TESTNET FIRST</small></div><pre><code><span>export const</span> rabbit = {'{'}{`\n`}  testnet: {'{'} chainId: <b>9280</b>, asset: <em>'RAB'</em> {'}'},{`\n`}  mainnet: {'{'} chainId: <b>928</b>, asset: <em>'RAB'</em> {'}'},{`\n\n`}  consensus: <em>'LCQ'</em>,{`\n`}  execution: <em>'EVM'</em>,{`\n`}  participation: <em>'permissionless'</em>{`\n`}{'}'}</code></pre><div className="code-tags"><span><TerminalSquare size={14}/> JSON-RPC</span><span><Blocks size={14}/> Solidity</span><span><ShieldCheck size={14}/> Open source</span></div></div></div>
      </section>

      <section className="status-home shell"><SectionHeader eyebrow="NETWORK READINESS" title="No fake live metrics." text="Until the public Testnet services are actually online, Rabbit shows readiness and reserved endpoints instead of pretending that a production network is live." />
        <div className="status-grid"><article><div><Zap size={20}/><span>TESTNET</span></div><h3>Public launch preparation</h3><p>Chain ID 9280 is the first public network target.</p><StatusDot tone="launch">PRE-LAUNCH</StatusDot></article><article><div><Gauge size={20}/><span>RPC & EXPLORER</span></div><h3>Infrastructure reserved</h3><p>Official endpoints are wired into the site but remain disabled until activation.</p><StatusDot>RESERVED</StatusDot></article><article><div><Code2 size={20}/><span>OPEN SOURCE</span></div><h3>Development in public</h3><p>Follow the official Rabbit GitHub for source code and website history.</p><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">Open GitHub <ArrowUpRight size={14}/></a></article></div>
      </section>

      <section className="final-cta"><div className="final-cta-glow"/><div className="shell final-cta-inner"><img src="/rabbit-mark.png" alt="Rabbit Chain"/><span>RABBIT CHAIN</span><h2>Testnet first.<br/><em>Fair participation from day one.</em></h2><p>Explore the protocol, prepare your node and follow the path to the first public Rabbit network.</p><div><Link className="button light" to="/testnet">Explore Testnet <ArrowRight size={15}/></Link><Link className="button dark-outline" to="/lcq">Understand LCQ</Link></div></div></section>
    </main>
  </>
}
