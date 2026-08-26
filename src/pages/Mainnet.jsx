import { Link } from 'react-router-dom'
import { ArrowRight, Blocks, Code2, Network, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { NETWORKS } from '../config/networks'

export default function Mainnet() {
  const n = NETWORKS.mainnet
  return (
    <main>
      <section className="page-hero mainnet-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy"><span className="hero-eyebrow"><i /> PRODUCTION NETWORK · AFTER TESTNET</span><h1>Mainnet follows <em>public proof.</em></h1><p>Rabbit Mainnet is the production network, but it does not lead the launch sequence. Testnet validates protocol behavior, infrastructure and tooling first.</p><div className="hero-ctas"><Link className="button primary" to="/testnet">Go to Testnet <ArrowRight size={15} /></Link><Link className="button secondary" to="/lcq">Review LCQ</Link></div></div>
          <div className="network-summary-card"><div className="network-summary-head"><div><img src="/rabbit-mark.png" alt="" /><span><b>RABBIT MAINNET</b><small>PRODUCTION NETWORK</small></span></div><em className={n.networkLive ? '' : 'future'}>{n.networkLive ? 'LIVE' : 'NOT LAUNCHED'}</em></div><div className="network-summary-grid"><div><span>CHAIN ID</span><strong>{n.chainId}</strong></div><div><span>HEX</span><strong>{n.chainIdHex}</strong></div><div><span>CONSENSUS</span><strong>LCQ</strong></div><div><span>EXECUTION</span><strong>EVM</strong></div><div><span>NATIVE ASSET</span><strong>RAB</strong></div><div><span>PHASE</span><strong>{n.networkLive ? 'PRODUCTION' : 'POST-TESTNET'}</strong></div></div></div>
        </div>
      </section>
      <section className="section shell"><SectionHeader eyebrow="MAINNET GATES" title="Production should inherit what Testnet proves." text="Mainnet opens only after the public path has exercised the protocol and surrounding infrastructure." /><div className="gate-grid"><article><span>01</span><Network size={22} /><h3>Network operation</h3><p>Independent nodes discover peers, sync, restart and propagate blocks reliably.</p></article><article><span>02</span><Blocks size={22} /><h3>Consensus behavior</h3><p>LCQ producer selection, fallback, rewards and recovery behave correctly under public operation.</p></article><article><span>03</span><Code2 size={22} /><h3>Developer surface</h3><p>EVM, JSON-RPC, wallets, explorer and tooling are validated on the public network.</p></article><article><span>04</span><ShieldCheck size={22} /><h3>Release integrity</h3><p>Final binaries, genesis, hashes and network configuration are deliberately finalized.</p></article></div></section>
      <section className="mainnet-path"><div className="shell"><SectionHeader eyebrow="LAUNCH ORDER" title="Testnet → validation → Mainnet." /><div className="mainnet-timeline"><article className="active"><span>01</span><div><b>Rabbit Testnet</b><p>First public network · Chain ID 9280.</p></div></article><article><span>02</span><div><b>Public validation</b><p>Consensus, nodes, wallet integration and infrastructure hardening.</p></div></article><article><span>03</span><div><b>Rabbit Mainnet</b><p>Production network · Chain ID 928.</p></div></article></div></div></section>
    </main>
  )
}
