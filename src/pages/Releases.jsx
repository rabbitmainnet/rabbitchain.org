import { Cpu, Download, FileCheck2, MonitorDown, TerminalSquare } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

const platforms = [['Windows', 'x86_64', MonitorDown], ['Linux / Ubuntu', 'x86_64', TerminalSquare], ['macOS', 'ARM64 / x86_64', Cpu]]

export default function Releases() {
  return (
    <main>
      <section className="page-hero releases-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> OFFICIAL SOFTWARE</span><h1>Release binaries should be <em>easy to verify.</em></h1><p>Rabbit releases will publish versioned Windows, Linux and macOS binaries with SHA-256 hashes and official source references.</p></div><div className="release-check-card"><FileCheck2 size={28} /><span>PUBLIC RELEASE GATE</span><strong>Pending Testnet binaries</strong><p>No download button is marked live before the files and verification hashes are intentionally published.</p></div></div></section>
      <section className="section shell"><SectionHeader eyebrow="PLATFORM TRACKS" title="One release center for every supported operating system." /><div className="download-grid">{platforms.map(([name, arch, Icon]) => <article key={name}><Icon size={22} /><span>{arch}</span><h3>{name}</h3><p>Official Rabbit client release track.</p><div className="download-meta"><small>VERSION</small><b>Pending</b><small>SHA-256</small><b>Published with release</b></div><button disabled><Download size={15} />Coming with Testnet</button></article>)}</div></section>
    </main>
  )
}
