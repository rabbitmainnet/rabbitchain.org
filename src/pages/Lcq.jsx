import LCQVisualizer from '../components/LCQVisualizer'
import SectionIntro from '../components/SectionIntro'

export default function Lcq() {
  return <div className="page-shell">
    <section className="page-hero">
      <span>TECHNOLOGY / LCQ CONSENSUS</span>
      <h1>Work proves participation.<br/><em>LCQ orders opportunity.</em></h1>
      <p>Live Consensus Queue is Rabbit's coordination layer for converting eligible participation into deterministic block-production opportunity.</p>
    </section>
    <section className="section-pad light-section">
      <SectionIntro index="01" label="CONSENSUS FLOW" title={<>From node to block, <em>one step at a time.</em></>} text="Use the interactive model to inspect the protocol flow without oversized text or clipped content."/>
      <LCQVisualizer/>
    </section>
    <section className="architecture-grid" id="architecture">
      <article><span>01</span><h3>Permissionless entry</h3><p>Participation starts by running the client and following network rules — not by requesting a producer slot.</p></article>
      <article><span>02</span><h3>Proof + activity</h3><p>Work and protocol activity contribute to eligibility state.</p></article>
      <article><span>03</span><h3>Deterministic ordering</h3><p>LCQ coordinates eligible participants into ordered producer opportunity.</p></article>
      <article><span>04</span><h3>Fallback + recovery</h3><p>The consensus design includes recovery behavior so network progress does not depend on a permanent producer.</p></article>
    </section>
    <section className="economics-page" id="economics">
      <div><span>CONSENSUS ECONOMICS</span><h2>Producer <em>70%</em><br/>Committee <em>30%</em></h2></div>
      <p>Block rewards reflect two distinct consensus roles: the producer creates the block and committee participants contribute to the consensus path.</p>
    </section>
  </div>
}
