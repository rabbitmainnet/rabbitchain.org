import { Link } from 'react-router-dom'
import {
  Activity, ArrowRight, Blocks, CheckCircle2, Clock3, Cpu, GitBranch,
  Network, RefreshCcw, ShieldCheck, Users,
} from 'lucide-react'
import ProtocolConsole from '../components/ProtocolConsole'
import SectionHeader from '../components/SectionHeader'

const steps = [
  ['01', Cpu, 'Valid work', 'A participant generates valid work under the active Rabbit proof rules.'],
  ['02', ShieldCheck, 'Eligibility', 'Protocol state determines whether the wallet can enter producer coordination.'],
  ['03', GitBranch, 'Live queue', 'Eligible participants are ordered under deterministic LCQ rules.'],
  ['04', Blocks, 'Producer', 'The selected participant receives the next block-production opportunity.'],
  ['05', Users, 'Committee', 'Committee participation completes the consensus and reward flow.'],
]

export default function Lcq() {
  return (
    <main>
      <section className="page-hero lcq-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> CORE TECHNOLOGY · LIVE CONSENSUS QUEUE</span>
            <h1>Work opens the door. <em>LCQ coordinates the next producer.</em></h1>
            <p>Rabbit separates valid participation from permanent control of block production. Eligibility and producer coordination are resolved by protocol rules.</p>
            <div className="hero-ctas"><a className="button primary" href="#flow">See the flow <ArrowRight size={15} /></a><a className="button secondary" href="#architecture">Architecture</a></div>
            <div className="hero-facts"><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>BLOCK TARGET</span><strong>~10s</strong></div><div><span>REWARD</span><strong>70 / 30</strong></div></div>
          </div>
          <ProtocolConsole compact />
        </div>
      </section>

      <section className="section shell" id="flow">
        <SectionHeader eyebrow="CONSENSUS FLOW" title="Five stages. One producer opportunity." text="LCQ is easier to evaluate when the full path is visible rather than reduced to a slogan." />
        <div className="lcq-process">
          {steps.map(([number, Icon, title, text], index) => (
            <article key={number} className={index === 2 ? 'active' : ''}>
              <div className="lcq-process-top"><span>{number}</span><Icon size={20} /></div><h3>{title}</h3><p>{text}</p>{index < steps.length - 1 && <i />}
            </article>
          ))}
        </div>
      </section>

      <section className="architecture-section" id="architecture">
        <div className="shell architecture-grid">
          <div className="architecture-copy"><span className="section-kicker">PROTOCOL ARCHITECTURE</span><h2>Consensus changes. The application surface stays familiar.</h2><p>Rabbit puts its differentiation in consensus while preserving the EVM execution model that wallets and developers already understand.</p><div className="architecture-points"><span><CheckCircle2 size={15} />EVM transactions and state</span><span><CheckCircle2 size={15} />Ethereum-style JSON-RPC</span><span><CheckCircle2 size={15} />Permissionless P2P networking</span></div></div>
          <div className="architecture-stack">
            <div><span>APPLICATIONS</span><strong>Wallets · dApps · contracts · explorers</strong><em>USER SURFACE</em></div>
            <b>↓</b>
            <div><span>EXECUTION</span><strong>EVM · transactions · state · JSON-RPC</strong><em>FAMILIAR TOOLING</em></div>
            <b>↓</b>
            <div className="accent"><span>CONSENSUS</span><strong>Work · Eligibility · LCQ · Producer · Committee</strong><em>RABBIT DIFFERENTIATION</em></div>
            <b>↓</b>
            <div><span>NETWORK</span><strong>P2P discovery · propagation · independent nodes</strong><em>PERMISSIONLESS</em></div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader eyebrow="OPERATING PRINCIPLES" title="The properties Rabbit needs to make obvious." text="These are the protocol behaviors miners, operators and developers should understand before Mainnet." />
        <div className="principle-cards four">
          <article className="principle-card"><div className="principle-card-top"><span>01</span><div><Network size={20} /></div></div><h3>Permissionless participation</h3><p>Running Rabbit should be enough to participate under protocol rules. No manual producer allowlist is the design goal.</p></article>
          <article className="principle-card"><div className="principle-card-top"><span>02</span><div><Activity size={20} /></div></div><h3>Live eligibility</h3><p>Producer opportunities are derived from valid participation and protocol state rather than a permanent slot.</p></article>
          <article className="principle-card"><div className="principle-card-top"><span>03</span><div><RefreshCcw size={20} /></div></div><h3>Fallback & recovery</h3><p>The protocol includes fallback and recovery behavior so participant changes do not require a human operator to choose the next producer.</p></article>
          <article className="principle-card"><div className="principle-card-top"><span>04</span><div><Clock3 size={20} /></div></div><h3>Target cadence</h3><p>Rabbit is designed around an approximately ten-second target block cadence, subject to finalized network parameters.</p></article>
        </div>
      </section>

      <section className="reward-feature" id="rewards">
        <div className="shell reward-feature-grid">
          <div><span className="section-kicker">BLOCK ECONOMICS</span><h2>One block. Two consensus roles.</h2><p>The block reward model explicitly recognizes the selected producer and committee participation.</p></div>
          <div className="reward-feature-bars"><div className="producer"><strong>70%</strong><span>PRODUCER</span></div><div className="committee"><strong>30%</strong><span>COMMITTEE</span></div></div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader eyebrow="LCQ FAQ" title="Technical enough to evaluate. Clear enough to understand." />
        <div className="faq-grid">
          <details open><summary>Is Rabbit just Proof of Work?</summary><p>Work is part of participation, while LCQ is the consensus coordination layer that organizes eligible participants and resolves producer opportunities.</p></details>
          <details><summary>Does the biggest miner automatically produce every block?</summary><p>The protocol design aims to separate valid participation from permanent producer control. Eligibility feeds LCQ coordination rather than creating a permanent seat.</p></details>
          <details><summary>Can anyone run a node?</summary><p>Rabbit is designed as a permissionless P2P network. Public release documentation defines the supported node and mining workflows.</p></details>
          <details><summary>Why Testnet first?</summary><p>Consensus, mining, node recovery, wallet integration and public infrastructure should be exercised before a production network carries real value.</p></details>
        </div>
        <div className="section-cta"><Link className="button primary" to="/mining">Mining path <ArrowRight size={14} /></Link><Link className="button secondary" to="/docs">Read protocol docs</Link></div>
      </section>
    </main>
  )
}
