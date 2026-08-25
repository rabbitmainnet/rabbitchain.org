import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Blocks, Braces, CheckCircle2, Code2, Cpu, FileCheck2,
  FlaskConical, Globe2, LockKeyhole, Network, Radio, ShieldCheck, TerminalSquare, Wallet
} from 'lucide-react'
import NetworkHero from '../components/NetworkHero'
import SectionHeader from '../components/SectionHeader'
import LaunchAction from '../components/LaunchAction'
import { NETWORKS } from '../config/networks'

const pillars=[
  ['01','OPEN PARTICIPATION','Participation begins with protocol-valid work, not a private producer list.',Cpu],
  ['02','DETERMINISTIC COORDINATION','LCQ orders eligible participants and resolves the next producer opportunity from protocol state.',Network],
  ['03','FAMILIAR EXECUTION','Applications keep an EVM surface while Rabbit concentrates its differentiation in consensus.',Code2],
]

const flow=[
  ['01','VALID WORK','A participant produces work accepted by protocol rules.'],
  ['02','ELIGIBILITY','The protocol evaluates whether that participant can enter coordination.'],
  ['03','QUEUE','LCQ establishes deterministic ordering for eligible participants.'],
  ['04','PRODUCER','The selected queue position receives the next block opportunity.'],
  ['05','COMMITTEE','Committee participation completes the consensus and reward path.']
]

const entry=[
  [Wallet,'USE','Connect to Rabbit','Wallet access, Testnet configuration and official network services.','/testnet'],
  [Cpu,'MINE','Participate in LCQ','Run Rabbit, produce valid work and enter the protocol coordination flow.','/mining'],
  [Network,'OPERATE','Run infrastructure','Sync the chain, join P2P and operate independent node infrastructure.','/nodes'],
  [Braces,'BUILD','Build with EVM','Use familiar contracts, JSON-RPC and developer tooling on Rabbit.','/developers']
]

export default function Home({walletState,onConnect,onAddNetwork}){
  const testnet=NETWORKS.testnet
  return <main className="rc7-home">
    <section className="rc7-home-hero">
      <div className="rc7-hero-ambient rc7-hero-ambient-a"/><div className="rc7-hero-ambient rc7-hero-ambient-b"/>
      <div className="shell rc7-home-hero-grid">
        <div className="rc7-hero-copy">
          <div className="rc7-eyebrow"><i/>ONE WALLET. ONE FAIR CHANCE.</div>
          <h1>Block production<br/>should be <em>earned.</em><br/><span>Not inherited.</span></h1>
          <p>Rabbit Chain is a permissionless EVM Layer 1 where <strong>LCQ Consensus</strong> turns valid work into a deterministic path to the next block-production opportunity.</p>
          <div className="rc7-hero-actions">
            <Link className="rc7-button rc7-button-primary" to="/testnet">Enter Testnet <ArrowRight size={16}/></Link>
            <Link className="rc7-button rc7-button-secondary" to="/lcq">Explore LCQ</Link>
            <button className="rc7-button rc7-button-ghost" onClick={onConnect}><Wallet size={16}/>{walletState.account?'Open wallet':'Connect wallet'}</button>
          </div>
          <div className="rc7-hero-proof">
            <div><span>FIRST PUBLIC NETWORK</span><strong>TESTNET 9280</strong></div>
            <div><span>CONSENSUS</span><strong>LCQ</strong></div>
            <div><span>EXECUTION</span><strong>EVM</strong></div>
          </div>
        </div>
        <div className="rc7-hero-visual"><NetworkHero/></div>
      </div>
      <div className="shell rc7-hero-bottomline"><span>PUBLIC TESTNET FIRST</span><i/><span>MAINNET 928 AFTER VALIDATION</span><i/><span>PERMISSIONLESS P2P</span><i/><span>~10s BLOCK TARGET</span></div>
    </section>

    <section className="rc7-thesis-section">
      <div className="shell">
        <div className="rc7-section-intro"><div><span>WHY RABBIT</span><h2>A network designed around <em>opportunity, not permanent privilege.</em></h2></div><p>The public interface should make Rabbit's core idea obvious: participants do valid work, the protocol determines eligibility, and LCQ coordinates who gets the next production opportunity.</p></div>
        <div className="rc7-pillar-grid">{pillars.map(([n,label,text,Icon])=><article key={n}><div className="rc7-pillar-top"><span>{n}</span><Icon size={22}/></div><h3>{label}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className="rc7-consensus-section" id="consensus">
      <div className="shell">
        <SectionHeader eyebrow="LCQ CONSENSUS" title="From valid work to the next producer — one protocol path." text="Rabbit keeps the application layer familiar and makes consensus coordination explicit: work, eligibility, queue position, producer selection and committee participation."/>
        <div className="rc7-flow-line">{flow.map(([n,title,text],i)=><article className={i===2?'active':''} key={n}><div><span>{n}</span>{i<flow.length-1&&<i/>}</div><strong>{title}</strong><p>{text}</p></article>)}</div>
        <div className="rc7-consensus-bottom">
          <div className="rc7-reward-card"><span>PROTOCOL REWARD MODEL</span><div><strong>70%</strong><b>PRODUCER</b></div><i/><div><strong>30%</strong><b>COMMITTEE</b></div><p>The reward split is defined by consensus rules, not by the website.</p></div>
          <div className="rc7-consensus-copy"><span>WHAT LCQ ADDS</span><h3>Coordination becomes a protocol surface — visible, deterministic and independent of a central scheduler.</h3><Link to="/lcq">See the LCQ architecture <ArrowUpRight size={15}/></Link></div>
        </div>
      </div>
    </section>

    <section className="rc7-network-section">
      <div className="shell">
        <div className="rc7-section-intro"><div><span>NETWORK LAUNCH PATH</span><h2>Two networks.<br/><em>One deliberate sequence.</em></h2></div><p>Rabbit Testnet is the public proving ground. Mainnet keeps a separate identity and follows only after public validation and production release gates.</p></div>
        <div className="rc7-network-cards">
          <article className="testnet"><div className="rc7-network-kicker"><i/>01 · FIRST PUBLIC NETWORK</div><h3>Rabbit Testnet</h3><p>Mining, nodes, wallets, contracts, RPC, explorer and recovery behavior are validated here first.</p><div className="rc7-network-specs"><span>CHAIN ID <b>9280</b></span><span>HEX <b>0x2440</b></span><span>ASSET <b>RAB</b></span><span>TEST ASSET <b>RUSD</b></span></div><Link to="/testnet">Enter Testnet <ArrowRight size={16}/></Link></article>
          <article className="mainnet"><div className="rc7-network-kicker">02 · PRODUCTION NETWORK</div><h3>Rabbit Mainnet</h3><p>The production network remains intentionally separate until Testnet validation and launch gates are complete.</p><div className="rc7-network-specs"><span>CHAIN ID <b>928</b></span><span>HEX <b>0x3a0</b></span><span>ASSET <b>RAB</b></span><span>STATUS <b>AFTER TESTNET</b></span></div><Link to="/mainnet">View Mainnet path <ArrowRight size={16}/></Link></article>
        </div>
      </div>
    </section>

    <section className="rc7-entry-section shell">
      <div className="rc7-entry-head"><span>ENTER THE NETWORK</span><h2>One portal for every role.</h2><p>Users, miners, node operators and developers should reach the right surface without digging through announcements or social threads.</p></div>
      <div className="rc7-entry-grid">{entry.map(([Icon,label,title,text,to])=><Link to={to} key={label}><div className="rc7-entry-icon"><Icon size={22}/></div><span>{label}</span><h3>{title}</h3><p>{text}</p><b>Open portal <ArrowUpRight size={15}/></b></Link>)}</div>
    </section>

    <section className="rc7-dev-section">
      <div className="shell rc7-dev-grid">
        <div className="rc7-dev-copy"><span>BUILD ON RABBIT</span><h2>Keep the EVM surface.<br/><em>Change the consensus underneath.</em></h2><p>Developers can work with familiar account, transaction, contract and JSON-RPC patterns while Rabbit's LCQ rules coordinate block production below the execution layer.</p><div><Link className="rc7-button rc7-button-light" to="/developers">Developer portal <ArrowRight size={15}/></Link><Link className="rc7-button rc7-button-dark-outline" to="/docs">Documentation</Link></div></div>
        <div className="rc7-code-panel"><div className="rc7-code-head"><span>rabbit.testnet</span><b>NETWORK CONFIG</b></div><pre><code><span>export const</span> rabbitTestnet = {'{'}{`\n`}  chainId: <b>9280</b>,{`\n`}  chainIdHex: <em>'0x2440'</em>,{`\n`}  currency: <em>'RAB'</em>,{`\n`}  consensus: <em>'LCQ'</em>,{`\n`}  execution: <em>'EVM'</em>{`\n`}{'}'}</code></pre><div className="rc7-code-foot"><span><CheckCircle2 size={13}/> EVM TOOLING</span><span><Radio size={13}/> JSON-RPC</span><span><Network size={13}/> P2P</span></div></div>
      </div>
    </section>

    <section className="launch-center-section shell rc7-launch-center">
      <div className="launch-center-head"><div><span>RABBIT TESTNET · OFFICIAL ENTRY POINTS</span><h2>Know what is available before you click.</h2></div><p>Wallet access is live. Public infrastructure remains explicitly marked Reserved until each service is intentionally activated.</p></div>
      <div className="launch-grid"><LaunchAction icon={Wallet} label="WALLET" title="Connect wallet" text="Browser wallets and WalletConnect without custody or seed phrase access." onClick={onConnect}/><LaunchAction icon={Network} label="NETWORK" title="Add Rabbit Testnet" text="Request Chain ID 9280 through your wallet's native EVM flow." onClick={()=>onAddNetwork(testnet)} badge="ADD NETWORK"/><LaunchAction icon={FlaskConical} label="FAUCET" title="Get Testnet assets" text="RAB and RUSD faucet access through the official service." to={testnet.faucetUrl} disabled={!testnet.publicFaucetReady} badge={testnet.publicFaucetReady?'OPEN':'RESERVED'}/><LaunchAction icon={Globe2} label="EXPLORER" title="Inspect the chain" text="Blocks, transactions, addresses and contracts through the official explorer." to={testnet.explorerUrl} disabled={!testnet.publicExplorerReady} badge={testnet.publicExplorerReady?'OPEN':'RESERVED'}/><LaunchAction icon={Cpu} label="MINING" title="Mining portal" text="Official software, release verification and LCQ participation path." to="/mining"/><LaunchAction icon={TerminalSquare} label="NODES" title="Node operations" text="Operate independent P2P, RPC and indexer infrastructure." to="/nodes"/></div>
    </section>

    <section className="rc7-trust-section">
      <div className="shell rc7-trust-grid"><div className="rc7-trust-copy"><span>VERIFY BEFORE YOU TRUST</span><h2>Official network surfaces should be <em>easy to verify.</em></h2><p>RabbitChain.org does not need your seed phrase or private key. Releases, status, documentation and official links should always be verifiable from the project portal.</p><Link to="/security">Open Security Center <ArrowRight size={15}/></Link></div><div className="rc7-trust-links"><Link to="/security"><ShieldCheck/><span><b>Security Center</b><small>Wallet and domain verification</small></span><ArrowUpRight size={15}/></Link><Link to="/releases"><FileCheck2/><span><b>Official Releases</b><small>Versions and checksums</small></span><ArrowUpRight size={15}/></Link><Link to="/status"><Radio/><span><b>Network Status</b><small>Live vs reserved services</small></span><ArrowUpRight size={15}/></Link><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer"><Code2/><span><b>Source Code</b><small>Official GitHub organization</small></span><ArrowUpRight size={15}/></a></div></div>
    </section>
  </main>
}
