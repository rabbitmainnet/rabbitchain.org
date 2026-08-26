import { ArrowUpRight, Code2, HeartHandshake, MessagesSquare, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function Community() {
  return (
    <main>
      <section className="page-hero community-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> RABBIT COMMUNITY</span><h1>Build the network <em>in public.</em></h1><p>Follow development, inspect the source and participate through official Rabbit channels and independent infrastructure.</p></div><div className="community-brand-card"><img src="/rabbit-mark.png" alt="Rabbit Chain" /><strong>RABBIT CHAIN</strong><span>OPEN SOURCE · P2P · PERMISSIONLESS</span><p>One wallet. One fair chance.</p></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="OFFICIAL CHANNELS" title="Know where Rabbit actually lives." text="Project communication should be easy to verify before users follow links, download software or connect wallets." /><div className="community-grid"><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer"><Code2 size={22} /><span>SOURCE</span><h3>GitHub</h3><p>Code, release history and official public repositories.</p><b>github.com/rabbitmainnet <ArrowUpRight size={14} /></b></a><a href="https://x.com/rabbit_mainnet" target="_blank" rel="noreferrer"><MessagesSquare size={22} /><span>UPDATES</span><h3>X / Twitter</h3><p>Testnet announcements, launch updates and public project communication.</p><b>@rabbit_mainnet <ArrowUpRight size={14} /></b></a><article><HeartHandshake size={22} /><span>CONTRIBUTE</span><h3>Community infrastructure</h3><p>Independent participants can operate nodes, RPCs, explorers and tooling around the network.</p></article><article><ShieldCheck size={22} /><span>VERIFY</span><h3>Security first</h3><p>Never share seed phrases or private keys. Verify software and endpoints before use.</p></article></div></section>
    </main>
  )
}
