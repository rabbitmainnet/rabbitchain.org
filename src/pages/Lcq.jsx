import { Link } from 'react-router-dom'
import {
  Activity, ArrowRight, CheckCircle2, Clock3, Cpu, GitBranch,
  Network, RefreshCcw, ShieldCheck, Users,
} from 'lucide-react'
import ProtocolConsole from '../components/ProtocolConsole'

const flow = [
  ['01', 'WORK', Cpu, 'Valid work', 'A participant generates work under the active Rabbit proof rules.'],
  ['02', 'ELIGIBILITY', ShieldCheck, 'Qualify', 'Protocol state determines whether the wallet can enter producer coordination.'],
  ['03', 'LCQ', GitBranch, 'Enter queue', 'Eligible participants are ordered under deterministic consensus rules.'],
  ['04', 'PRODUCER', Activity, 'Produce', 'The selected participant receives the next block-production opportunity.'],
  ['05', 'COMMITTEE', Users, 'Complete', 'Committee participation completes the consensus and reward flow.'],
]

const principles = [
  [Network, 'Permissionless participation', 'Rabbit is designed so participation comes from running the protocol under its rules, not from a permanent producer allowlist.'],
  [Activity, 'Live eligibility', 'Persistent equal seats define canonical participation, while LCQ uses protocol state to coordinate producer opportunities among active eligible seats.'],
  [RefreshCcw, 'Fallback & recovery', 'Fallback and recovery behavior belongs in protocol logic so participant changes do not require a human coordinator.'],
  [Clock3, 'Target cadence', 'Rabbit is designed around an approximately ten-second target block cadence, subject to finalized network parameters.'],
]

export default function Lcq() {
  return (
    <main>
      <section className="lcq-v2-hero">
        <div className="shell lcq-v2-hero-grid">
          <div className="lcq-v2-copy">
            <span className="hero-eyebrow"><i /> CORE TECHNOLOGY · LIVE CONSENSUS QUEUE</span>
            <h1>Work opens the door. <em>LCQ decides what comes next.</em></h1>
            <p>Rabbit separates valid participation from permanent control of block production. Eligibility and producer coordination are resolved by protocol rules.</p>
            <div className="hero-ctas"><a className="button primary" href="#flow">See the flow <ArrowRight size={15} /></a><a className="button secondary" href="#architecture">Architecture</a></div>
            <div className="lcq-v2-facts"><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>BLOCK TARGET</span><strong>~10s</strong></div><div><span>REWARD</span><strong>70 / 30</strong></div></div>
          </div>
          <ProtocolConsole compact />
        </div>
      </section>

      <section className="lcq-v2-flow" id="flow">
        <div className="shell">
          <div className="lcq-v2-section-head"><div><span className="section-kicker">CONSENSUS FLOW</span><h2>Five stages. One producer opportunity.</h2></div><p>The full path is intentionally visible: work, eligibility, queue, producer and committee.</p></div>
          <div className="consensus-rail light">
            {flow.map(([number, label, Icon, title, text], index) => (
              <div className="consensus-rail-item-wrap" key={number}>
                <article className={index === 2 ? 'active' : ''}><span>{number}</span><small>{label}</small><Icon size={20} /><h3>{title}</h3><p>{text}</p></article>
                {index < flow.length - 1 && <i />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lcq-v2-architecture" id="architecture">
        <div className="shell lcq-v2-architecture-grid">
          <div><span className="section-kicker">PROTOCOL ARCHITECTURE</span><h2>Consensus changes. The application surface stays familiar.</h2><p>Rabbit puts its differentiation in producer coordination while preserving the EVM execution model that wallets and developers already understand.</p><div className="architecture-points"><span><CheckCircle2 size={15} />EVM transactions and state</span><span><CheckCircle2 size={15} />Ethereum-style JSON-RPC</span><span><CheckCircle2 size={15} />Permissionless P2P networking</span></div></div>
          <div className="architecture-layers">
            <div><small>04 · APPLICATIONS</small><strong>Wallets · dApps · contracts · explorers</strong><span>USER SURFACE</span></div>
            <i />
            <div><small>03 · EXECUTION</small><strong>EVM · transactions · state · JSON-RPC</strong><span>FAMILIAR TOOLING</span></div>
            <i />
            <div className="accent"><small>02 · CONSENSUS</small><strong>Work · Eligibility · LCQ · Producer · Committee</strong><span>RABBIT DIFFERENTIATION</span></div>
            <i />
            <div><small>01 · NETWORK</small><strong>P2P discovery · propagation · independent nodes</strong><span>PERMISSIONLESS</span></div>
          </div>
        </div>
      </section>

      <section className="lcq-v2-principles">
        <div className="shell lcq-v2-principles-grid">
          <div><span className="section-kicker">OPERATING PRINCIPLES</span><h2>The properties miners and operators should be able to inspect.</h2><p>Rabbit’s consensus story should be understandable without reducing it to a slogan.</p></div>
          <div className="principle-rows">
            {principles.map(([Icon, title, text], index) => <div key={title}><span>0{index + 1}</span><Icon size={19} /><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="lcq-v2-reward" id="rewards">
        <div className="shell">
          <div className="lcq-v2-reward-head"><div><span className="section-kicker">BLOCK ECONOMICS</span><h2>One block. Two consensus roles.</h2></div><p>The reward model recognizes the selected producer and committee participation explicitly.</p></div>
          <div className="reward-meter large"><div className="producer"><b>70%</b><span>PRODUCER</span><small>selected block opportunity</small></div><div className="committee"><b>30%</b><span>COMMITTEE</span><small>consensus participation</small></div></div>
        </div>
      </section>

      <section className="section shell">
        <div className="lcq-v2-faq-head"><span className="section-kicker">LCQ FAQ</span><h2>Technical enough to evaluate. Clear enough to understand.</h2></div>
        <div className="faq-grid">
          <details open><summary>Is Rabbit just Proof of Work?</summary><p>Work is part of participation, while LCQ is the consensus coordination layer that organizes eligible participants and resolves producer opportunities.</p></details>
          <details><summary>Does the biggest miner automatically produce every block?</summary><p>The protocol separates a persistent consensus seat from permanent control of block production. Work V2 admission can establish one persistent equal seat per wallet; LCQ then coordinates producer opportunities among active eligible seats. More CPU speed does not give an already-admitted wallet extra seats or recurring consensus weight.</p></details>
          <details><summary>Can anyone run a node?</summary><p>Rabbit is designed as a permissionless P2P network. Public release documentation defines the supported node and mining workflows.</p></details>
          <details><summary>Why Testnet first?</summary><p>Consensus, mining, node recovery, wallet integration and public infrastructure should be exercised before a production network carries real value.</p></details>
        </div>
        <div className="section-cta"><Link className="button primary" to="/mining">Mining path <ArrowRight size={14} /></Link><Link className="button secondary" to="/docs">Read protocol docs</Link></div>
      </section>
    </main>
  )
}
