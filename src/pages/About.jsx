import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Network, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function About() {
  return (
    <main>
      <section className="page-hero about-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> ABOUT RABBIT CHAIN</span><h1>Open infrastructure for <em>fairer participation.</em></h1><p>Rabbit Chain is an EVM Layer 1 built around LCQ Consensus and a simple public principle: one wallet, one fair chance.</p><div className="hero-ctas"><Link className="button primary" to="/lcq">Understand LCQ <ArrowRight size={14} /></Link><a className="button secondary" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">Open source</a></div></div><div className="about-principles"><div><Network size={21} /><span>PERMISSIONLESS</span><strong>Open P2P participation</strong></div><div><Code2 size={21} /><span>EVM</span><strong>Familiar execution tooling</strong></div><div><ShieldCheck size={21} /><span>PROTOCOL</span><strong>Coordination by consensus rules</strong></div></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="PROJECT PRINCIPLES" title="The network should be understandable without trusting a central operator." /><div className="principle-cards"><article className="principle-card"><span>01</span><h3>Open participation</h3><p>Miners, nodes, developers and infrastructure providers should have clear public paths into the network.</p></article><article className="principle-card"><span>02</span><h3>Explicit readiness</h3><p>Services remain labeled reserved until they are genuinely public. No invented metrics or fake activity.</p></article><article className="principle-card"><span>03</span><h3>Verifiable software</h3><p>Source, binaries, hashes and public configuration should be easy to inspect from official project channels.</p></article></div></section>
    </main>
  )
}
