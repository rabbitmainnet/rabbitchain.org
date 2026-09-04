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
      <section className="page-hero mining-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> PERMISSIONLESS TESTNET MINING</span><h1>One wallet. <em>One equal consensus seat.</em></h1><p>Rabbit Work V2 uses RandomX for one-time admission. Once activated, CPU speed cannot create extra consensus weight.</p><div className="hero-ctas"><a className="button primary" href="#downloads">Download Rabbit Core <ArrowRight size={15} /></a><Link className="button secondary" to="/lcq">How LCQ works</Link></div></div><div className="terminal-card"><div className="terminal-head"><span>rabbit-core</span><b>WORK V2</b></div><pre><code><span>$</span> Start-Rabbit-Core.cmd{`\n\n`}<b>✓</b> encrypted wallet created locally{`\n`}<b>✓</b> P2P full node synchronized{`\n`}<b>✓</b> permissionless admission enabled{`\n`}<b>✓</b> persistent equal-seat LCQ loaded{`\n\n`}<em>Rabbit Core Testnet V2.1 ready_</em></code></pre></div></div></section>

      <section className="section shell" id="downloads">
        <SectionHeader
          eyebrow="OFFICIAL RELEASES"
          title="Verified Rabbit Core Testnet V2.1 downloads."
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
                  <b>Testnet V2.1</b>
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

      <section className="mining-flow-section"><div className="shell"><SectionHeader eyebrow="COMPLETE MINING FLOW" title="What happens from download to an active seat." /><div className="mining-steps"><article><span>01</span><Download size={21} /><h3>Download and verify</h3><p>Use the official Rabbit Core Testnet V2.1 Windows or Linux package and match its SHA-256 before extracting it.</p></article><article><span>02</span><HardDrive size={21} /><h3>Create and back up</h3><p>Rabbit Core creates an encrypted wallet locally. Back up the printed <code>UTC--...</code> keystore file and store its password separately.</p></article><article><span>03</span><Cpu size={21} /><h3>Synchronize and wait</h3><p>Keep Rabbit Core open while it synchronizes to the public chain. Work V2 admission is organized around canonical 128-block epochs; a new wallet waits for the applicable admission window rather than an absolute block number counted from genesis.</p></article><article><span>04</span><FileCheck2 size={21} /><h3>Admission proof</h3><p>RandomX prepares a 1 GiB dataset and searches for the wallet's one-time admission proof. After acceptance, Rabbit Miner reports the proof as accepted and the wallet remains <code>LCQ PENDING</code> while it waits for the later selection and activation boundary.</p></article><article><span>05</span><ShieldCheck size={21} /><h3>Persistent activation</h3><p>After admission, the wallet must pass through the following Work V2 selection and activation cycle. Depending on when it joins, the complete path can span roughly up to 256 canonical blocks. <code>LCQ ACTIVE</code> / <code>ACTIVE LCQ seat</code> means the wallet is active with one equal consensus seat.</p></article><article><span>06</span><TerminalSquare size={21} /><h3>Stay online for LCQ</h3><p>The node remains online to validate, join deterministic block-production opportunities and receive canonical producer or committee rewards.</p></article></div></div></section>

      <section className="section shell"><div className="operator-split"><div><span className="section-kicker">WAITING IS EXPECTED</span><h2>Activation follows canonical height, not a local timer.</h2><p>If the network is paused or blocks arrive slowly, the relevant 128-block epoch boundaries also take longer. <code>LCQ PENDING</code> means the accepted wallet is waiting on canonical chain progress and selection; activation is never based on a local countdown.</p><p>If every producer disconnects, the chain pauses without resetting. After a two-minute canonical halt, permissionless recovery admission opens so any compatible non-zero wallet can submit a valid RandomX proof and resume the existing chain.</p></div><div className="operator-cards"><article><Cpu size={22} /><h3>Fair admission</h3><ul><li>One persistent seat per wallet</li><li>No recurring RandomX weight</li><li>Faster CPUs cannot gain extra seats</li><li>Permissionless recovery</li></ul></article><article><TerminalSquare size={22} /><h3>Canonical rewards</h3><ul><li>70% selected producer</li><li>30% eligible committee</li><li>Current testnet reward: 1.2 tRAB</li><li>All payments verified on-chain</li></ul></article></div></div></section>

      <section className="section shell"><SectionHeader eyebrow="WALLET AND DATA" title="Know exactly what to back up." /><div className="operator-cards"><article><MonitorDown size={22} /><h3>Windows</h3><p>Main folder: <code>%APPDATA%\RabbitChain\TestnetV2</code></p><p>Wallet: <code>keystore\UTC--...</code></p><p>Chain: <code>rabbit\chaindata</code></p><p>Log: <code>logs\rabbit-node.log</code></p></article><article><TerminalSquare size={22} /><h3>Linux</h3><p>Main folder: <code>${'${XDG_CONFIG_HOME:-$HOME/.config}'}/RabbitChain/TestnetV2</code></p><p>Wallet: <code>keystore/UTC--...</code></p><p>Chain: <code>rabbit/chaindata</code></p><p>Log: <code>logs/rabbit-node.log</code></p></article></div><p>Never share a password, private key, seed phrase or keystore. The temporary <code>.rabbit-session-password-*</code> file is removed when Rabbit Core closes and is not a backup.</p></section>

      <section className="section shell"><div className="operator-split"><div><span className="section-kicker">MINER VS NODE</span><h2>Participation and infrastructure are related, but not identical.</h2><p>A miner participates in work and LCQ opportunities. A node can relay, query, index or expose infrastructure without being the same workflow.</p><Link className="inline-link" to="/nodes">Node operator guide <ArrowRight size={14} /></Link></div><div className="operator-cards"><article><Cpu size={22} /><h3>Miner</h3><ul><li>Valid work</li><li>Participant wallet</li><li>LCQ eligibility</li><li>Producer opportunities</li></ul></article><article><TerminalSquare size={22} /><h3>Node operator</h3><ul><li>P2P participation</li><li>Chain synchronization</li><li>RPC / infrastructure</li><li>Independent operation</li></ul></article></div></div></section>

      <section className="security-callout"><div className="shell"><ShieldCheck size={24} /><div><span>RELEASE SECURITY</span><h2>Never run a binary you cannot verify.</h2><p>Rabbit releases should be downloaded from official sources and matched against published hashes before use.</p></div><Link className="button light" to="/releases">Release center</Link></div></section>
    </main>
  )
}
