import { Link } from 'react-router-dom'
import { ArrowRight, Coins, Fuel, Gift, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function Rab() {
  return (
    <main>
      <section className="page-hero rab-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> NATIVE ASSET</span><h1>Native assets for <em>each Rabbit network.</em></h1><p>Rabbit Testnet uses tRAB exclusively for testing. The future Rabbit Mainnet will use RAB as its native asset.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Use Testnet <ArrowRight size={14} /></Link><Link className="button secondary" to="/lcq#rewards">Reward model</Link></div></div><div className="asset-card"><img src="/rabbit-mark.png" alt="Rabbit" /><span>NATIVE ASSET</span><strong>RAB / tRAB</strong><p>Gas · consensus rewards · network utility</p><div><span>TESTNET<small>tRAB · testing only</small></span><span>MAINNET<small>RAB · not launched</small></span></div></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="NETWORK ROLE" title="Native assets with the same protocol roles." /><div className="principle-cards"><article className="principle-card"><div className="principle-card-top"><span>01</span><div><Fuel size={20} /></div></div><h3>EVM gas</h3><p>tRAB pays transaction fees on Testnet. RAB will serve that role on Mainnet after launch.</p></article><article className="principle-card"><div className="principle-card-top"><span>02</span><div><Gift size={20} /></div></div><h3>Consensus rewards</h3><p>Rabbit's block reward model distributes 70% to the producer role and 30% to committee participation.</p></article><article className="principle-card"><div className="principle-card-top"><span>03</span><div><Coins size={20} /></div></div><h3>Network utility</h3><p>Each network keeps its native balances separate: tRAB on Testnet and RAB on the future Mainnet.</p></article></div></section>
      <section className="safety-section"><div className="shell safety-grid"><div><ShieldCheck size={28} /><span>TESTNET NOTICE</span><h2>tRAB has no Mainnet value.</h2></div><div><p>Testnet assets exist to validate wallets, contracts, mining and infrastructure. Mainnet economics should be documented separately when the production launch is finalized.</p></div></div></section>
    </main>
  )
}
