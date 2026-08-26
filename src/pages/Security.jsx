import { ArrowUpRight, Code2, FileCheck2, Globe2, ShieldCheck, Wallet } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function Security() {
  return (
    <main>
      <section className="page-hero security-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> RABBIT SECURITY CENTER</span><h1>Verify first. <em>Trust less.</em></h1><p>Use official domains, public repositories and release hashes. Wallet connection never requires your seed phrase or private key.</p></div><div className="security-card"><ShieldCheck size={30} /><span>OFFICIAL DOMAIN</span><strong>rabbitchain.org</strong><p>Wallet connection shares a public address and selected network only.</p><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">github.com/rabbitmainnet <ArrowUpRight size={14} /></a></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="SECURITY CHECKLIST" title="Four checks before you connect, download or transact." /><div className="security-grid"><article><Globe2 size={21} /><span>DOMAIN</span><h3>Verify the URL</h3><p>Use rabbitchain.org and official Rabbit subdomains. Avoid lookalike domains and unsolicited wallet links.</p></article><article><Wallet size={21} /><span>WALLET</span><h3>Never share secrets</h3><p>Rabbit does not need seed phrases or private keys. Review every wallet signature and transaction request.</p></article><article><FileCheck2 size={21} /><span>RELEASES</span><h3>Check hashes</h3><p>Match public binaries against the SHA-256 published with the official release before running them.</p></article><article><Code2 size={21} /><span>SOURCE</span><h3>Inspect repositories</h3><p>Official code and website history live under the Rabbit GitHub organization.</p></article></div></section>
    </main>
  )
}
