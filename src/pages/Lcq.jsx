import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, CheckCircle2, CircleDot, Cpu, GitBranch, Network,
  RefreshCcw, Route, ShieldCheck, Split, TimerReset, Users
} from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import NetworkHero from '../components/NetworkHero'

const properties=[
  [CircleDot,'VALID WORK FIRST','Participation begins with work accepted by protocol rules — not with a manually assigned producer slot.'],
  [ShieldCheck,'ELIGIBILITY','The protocol determines whether a participant can enter the active coordination set.'],
  [Route,'DETERMINISTIC QUEUE','Eligible participants are ordered by LCQ instead of being selected by an external scheduler.'],
  [Cpu,'PRODUCER OPPORTUNITY','The selected queue position receives the next block-production opportunity.'],
  [Users,'COMMITTEE ROLE','Committee participation is part of the consensus path and has its own reward share.'],
  [RefreshCcw,'RECOVERY RULES','Fallback and recovery behavior belongs in protocol logic so progress is not dependent on a human operator.']
]

const stages=[
  ['01','WORK','Participant','Valid work enters the protocol path.'],
  ['02','ELIGIBILITY','Protocol','Rules determine whether the participant may enter coordination.'],
  ['03','QUEUE','LCQ','Eligible participants receive deterministic queue positions.'],
  ['04','PRODUCER','Selected position','The next opportunity is assigned from queue state.'],
  ['05','COMMITTEE','Consensus','Committee participation completes the block path.'],
  ['06','REWARD','Protocol','Producer and committee rewards follow the defined split.']
]

export default function Lcq(){return <main className="rc7-lcq-page">
  <section className="rc7-lcq-hero">
    <div className="rc7-hero-ambient rc7-hero-ambient-a"/><div className="rc7-hero-ambient rc7-hero-ambient-b"/>
    <div className="shell rc7-lcq-hero-grid">
      <div className="rc7-lcq-copy">
        <div className="rc7-eyebrow"><i/>LIVE CONSENSUS QUEUE</div>
        <span className="rc7-lcq-overline">RABBIT CORE TECHNOLOGY</span>
        <h1>From valid work<br/>to the <em>next producer.</em></h1>
        <p>LCQ is Rabbit Chain's consensus coordination layer. It evaluates participation, establishes deterministic ordering and turns eligible work into a protocol-defined block-production opportunity.</p>
        <div className="rc7-lcq-actions"><a className="rc7-button rc7-button-primary" href="#architecture">See the architecture <ArrowRight size={15}/></a><Link className="rc7-button rc7-button-secondary" to="/mining">Mining path</Link></div>
        <div className="rc7-lcq-facts"><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>BLOCK TARGET</span><strong>~10s</strong></div><div><span>REWARD</span><strong>70 / 30</strong></div></div>
      </div>
      <div className="rc7-lcq-visual"><NetworkHero/></div>
    </div>
  </section>

  <section className="rc7-lcq-statement">
    <div className="shell rc7-lcq-statement-grid"><span>THE CORE IDEA</span><h2>Mining finds valid participation.<br/><em>LCQ coordinates production.</em></h2><p>Rabbit separates the act of producing valid work from a permanent right to produce blocks. Coordination is resolved by consensus state, not by a website, private scheduler or manual operator.</p></div>
  </section>

  <section className="rc7-lcq-properties shell">
    <SectionHeader eyebrow="PROTOCOL PROPERTIES" title="What LCQ is responsible for." text="Each step exists for a different reason. Together they form the coordination path between valid work and the next accepted block-production opportunity."/>
    <div className="rc7-lcq-property-grid">{properties.map(([Icon,title,text],i)=><article key={title}><div className="rc7-property-top"><span>{String(i+1).padStart(2,'0')}</span><Icon size={22}/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>

  <section className="rc7-lcq-architecture" id="architecture">
    <div className="shell">
      <div className="rc7-section-intro light"><div><span>LCQ ARCHITECTURE</span><h2>Six stages.<br/><em>One deterministic path.</em></h2></div><p>The architecture is easier to understand when the responsibilities are separated: work, eligibility, queue, producer, committee and rewards.</p></div>
      <div className="rc7-stage-list">{stages.map(([n,title,owner,text],i)=><article className={i===2?'active':''} key={n}><span className="rc7-stage-number">{n}</span><div className="rc7-stage-icon">{i===0?<CircleDot/>:i===1?<ShieldCheck/>:i===2?<GitBranch/>:i===3?<Cpu/>:i===4?<Users/>:<Split/>}</div><div><small>{owner}</small><h3>{title}</h3><p>{text}</p></div>{i<stages.length-1&&<i/>}</article>)}</div>
    </div>
  </section>

  <section className="rc7-lcq-reward-section" id="rewards">
    <div className="shell rc7-lcq-reward-grid"><div className="rc7-lcq-reward-copy"><span>REWARD MODEL</span><h2>Two consensus roles.<br/><em>One protocol-defined split.</em></h2><p>Rabbit makes the producer and committee shares explicit so the economic path is visible alongside the consensus path.</p><Link to="/rab">Understand RAB <ArrowUpRight size={15}/></Link></div><div className="rc7-reward-board"><div className="producer"><span>BLOCK PRODUCER</span><strong>70%</strong><p>Reward share assigned to the producer role.</p></div><div className="committee"><span>COMMITTEE</span><strong>30%</strong><p>Reward share assigned to committee participation.</p></div><div className="rc7-reward-bar"><i/><b/></div><small>CONSENSUS-DEFINED DISTRIBUTION</small></div></div>
  </section>

  <section className="rc7-lcq-resilience shell">
    <div className="rc7-section-intro"><div><span>NETWORK RESILIENCE</span><h2>A permissionless protocol must handle <em>change.</em></h2></div><p>Participants arrive, leave and return. Rabbit's coordination model is designed so recovery behavior belongs to protocol rules rather than manual producer assignment.</p></div>
    <div className="rc7-resilience-grid"><article><TimerReset/><span>PARTICIPANTS LEAVE</span><h3>Progress cannot assume the same producer is always present.</h3><p>Consensus needs a defined path when an expected participant is unavailable.</p></article><article><RefreshCcw/><span>PARTICIPANTS RETURN</span><h3>Recovery belongs to the network, not to an administrator.</h3><p>Returning participation should re-enter through protocol rules instead of private intervention.</p></article><article><Network/><span>P2P CONTINUES</span><h3>Independent nodes remain part of the system.</h3><p>Consensus coordination and peer-to-peer propagation are separate responsibilities that work together.</p></article></div>
  </section>

  <section className="rc7-lcq-boundaries">
    <div className="shell"><SectionHeader eyebrow="CLEAR BOUNDARIES" title="What LCQ does — and what it does not ask from users."/>
      <div className="rc7-boundary-grid"><article><CheckCircle2/><h3>Protocol coordination</h3><p>LCQ coordinates eligibility, queue state and producer opportunity inside the consensus path.</p></article><article><CheckCircle2/><h3>No website custody</h3><p>RabbitChain.org does not need a seed phrase or private key to explain or access the network.</p></article><article><CheckCircle2/><h3>No manual producer list</h3><p>The public design goal is protocol-driven participation rather than a private website-controlled allowlist.</p></article></div>
    </div>
  </section>

  <section className="rc7-lcq-final"><div className="shell"><div><span>RABBIT TESTNET</span><h2>See LCQ where it matters:<br/><em>on the public network.</em></h2></div><div><Link className="rc7-button rc7-button-primary" to="/testnet">Enter Testnet <ArrowRight size={15}/></Link><Link className="rc7-button rc7-button-secondary" to="/docs">Read documentation</Link></div></div></section>
</main>}
