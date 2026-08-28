import { Link } from 'react-router-dom'
import { ArrowRight, Coins, Fuel, Gift, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function Rab() {
  return (
    <main>
      <section className="page-hero rab-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> NATIVE ASSET</span><h1>RAB powers the <em>Rabbit network.</em></h1><p>RAB is the native asset used for EVM gas and Rabbit consensus economics across Testnet and, after launch, Mainnet.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Use Testnet <ArrowRight size={14} /></Link><Link className="button secondary" to="/lcq#rewards">Reward model</Link></div></div><div className="asset-card"><img src="/rabbit-mark.png" alt="Rabbit" /><span>NATIVE ASSET</span><strong>RAB</strong><p>Gas · consensus rewards · network utility</p><div><span>TESTNET<small>Testing only</small></span><span>MAINNET<small>After public validation</small></span></div></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="NETWORK ROLE" title="One native asset, several protocol roles." /><div className="principle-cards"><article className="principle-card"><div className="principle-card-top"><span>01</span><div><Fuel size={20} /></div></div><h3>EVM gas</h3><p>RAB is the native currency used for transaction fees on Rabbit execution.</p></article><article className="principle-card"><div className="principle-card-top"><span>02</span><div><Gift size={20} /></div></div><h3>Consensus rewards</h3><p>Rabbit's block reward model distributes 70% to the producer role and 30% to committee participation.</p></article><article className="principle-card"><div className="principle-card-top"><span>03</span><div><Coins size={20} /></div></div><h3>Network utility</h3><p>The native asset anchors wallet balances and application-level interactions across the Rabbit ecosystem.</p></article></div></section>
      <section className="safety-section"><div className="shell safety-grid"><div><ShieldCheck size={28} /><span>TESTNET NOTICE</span><h2>tRAB has no Mainnet value.</h2></div><div><p>Testnet assets exist to validate wallets, contracts, mining and infrastructure. Mainnet economics should be documented separately when the production launch is finalized.</p></div></div></section>
    </main>
  )
}
