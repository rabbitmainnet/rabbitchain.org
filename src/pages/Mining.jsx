import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, Download, FileCheck2, HardDrive, MonitorDown, ShieldCheck, TerminalSquare } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { DOWNLOADS } from '../config/release'

const icons = {
  'windows-amd64': MonitorDown,
  'linux-amd64': TerminalSquare,
}

export default function Mining() {
  return (
    <main>
      <section className="page-hero mining-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> TESTNET MINING FIRST</span><h1>Download. Run. <em>Compete for opportunity.</em></h1><p>Rabbit mining is designed around permissionless participation: generate valid work and let LCQ coordinate block-production opportunities.</p><div className="hero-ctas"><a className="button primary" href="#downloads">Download Rabbit Core <ArrowRight size={15} /></a><Link className="button secondary" to="/lcq">How LCQ works</Link></div></div><div className="terminal-card"><div className="terminal-head"><span>rabbit-node</span><b>TESTNET PROFILE</b></div><pre><code><span>$</span> rabbit --network rabbit-testnet{`\n\n`}<b>✓</b> client initialized{`\n`}<b>✓</b> P2P discovery enabled{`\n`}<b>✓</b> LCQ consensus loaded{`\n`}<b>✓</b> participant wallet configured{`\n\n`}<em>Rabbit Core Testnet v1 ready_</em></code></pre></div></div></section>

      <section className="section shell" id="downloads">
        <SectionHeader
          eyebrow="OFFICIAL RELEASES"
          title="Verified Rabbit Core Testnet v1 downloads."
          text="Download from the official GitHub release and verify the archive SHA-256 before running it."
        />
        <div className="download-grid">
          {DOWNLOADS.map((download) => {
            const Icon = icons[download.key]
            return (
              <article key={download.key}>
                <Icon size={22} />
                <span>{download.architecture}</span>
                <h3>{download.platform}</h3>
                <p>{download.format} package</p>
                <div className="download-meta">
                  <small>VERSION</small>
                  <b>Testnet v1</b>
                  <small>SHA-256</small>
                  <code>{download.sha256}</code>
                </div>
                <a
                  className="button primary"
                  href={download.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={15} />Download
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mining-flow-section"><div className="shell"><SectionHeader eyebrow="MINING FLOW" title="Four steps from release to participation." /><div className="mining-steps"><article><span>01</span><Download size={21} /><h3>Download</h3><p>Use the official Rabbit release for your operating system.</p></article><article><span>02</span><FileCheck2 size={21} /><h3>Verify</h3><p>Compare the binary SHA-256 before executing it.</p></article><article><span>03</span><HardDrive size={21} /><h3>Initialize</h3><p>Create a clean Testnet data directory and participant wallet configuration.</p></article><article><span>04</span><Cpu size={21} /><h3>Participate</h3><p>Connect to P2P, generate valid work and enter LCQ when eligible.</p></article></div></div></section>

      <section className="section shell"><div className="operator-split"><div><span className="section-kicker">MINER VS NODE</span><h2>Participation and infrastructure are related, but not identical.</h2><p>A miner participates in work and LCQ opportunities. A node can relay, query, index or expose infrastructure without being the same workflow.</p><Link className="inline-link" to="/nodes">Node operator guide <ArrowRight size={14} /></Link></div><div className="operator-cards"><article><Cpu size={22} /><h3>Miner</h3><ul><li>Valid work</li><li>Participant wallet</li><li>LCQ eligibility</li><li>Producer opportunities</li></ul></article><article><TerminalSquare size={22} /><h3>Node operator</h3><ul><li>P2P participation</li><li>Chain synchronization</li><li>RPC / infrastructure</li><li>Independent operation</li></ul></article></div></div></section>

      <section className="security-callout"><div className="shell"><ShieldCheck size={24} /><div><span>RELEASE SECURITY</span><h2>Never run a binary you cannot verify.</h2><p>Rabbit releases should be downloaded from official sources and matched against published hashes before use.</p></div><Link className="button light" to="/releases">Release center</Link></div></section>
    </main>
  )
}
