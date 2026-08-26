import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FileText, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function Whitepaper() {
  return (
    <main>
      <section className="page-hero whitepaper-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> OFFICIAL PROTOCOL PAPER</span><h1>The protocol, <em>documented properly.</em></h1><p>The Rabbit Chain Whitepaper will describe the protocol that actually ships: LCQ, network architecture, mining, eligibility, economics, security and the Testnet-to-Mainnet path.</p><div className="hero-ctas"><button className="button primary" disabled>Whitepaper in preparation</button><Link className="button secondary" to="/docs">Explore Docs <ArrowRight size={14} /></Link></div></div><div className="whitepaper-card"><div><img src="/rabbit-mark.png" alt="" /><span>RABBIT CHAIN</span></div><strong>Technical Whitepaper</strong><p>Protocol paper · in preparation</p><section><span>LCQ CONSENSUS</span><span>EVM EXECUTION</span><span>NETWORK ECONOMICS</span><span>SECURITY MODEL</span></section></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="WHITEPAPER SCOPE" title="More than a marketing document." text="The paper should stay tied to finalized implementation and validated network parameters." /><div className="resource-grid"><article><BookOpen size={22} /><span>CONSENSUS</span><h3>LCQ</h3><p>Eligibility, queue formation, producer selection, committee participation and recovery.</p></article><article><FileText size={22} /><span>ARCHITECTURE</span><h3>Network design</h3><p>EVM execution, P2P, nodes, mining, JSON-RPC and the block lifecycle.</p></article><article><ShieldCheck size={22} /><span>ECONOMICS & SECURITY</span><h3>Protocol incentives</h3><p>Reward distribution, security assumptions and launch model.</p></article></div></section>
    </main>
  )
}
