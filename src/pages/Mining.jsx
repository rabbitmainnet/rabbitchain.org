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
      <section className="page-hero mining-hero"><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="hero-eyebrow"><i /> PERMISSIONLESS TESTNET MINING</span><h1>One wallet. <em>One equal consensus seat.</em></h1><p>Rabbit Work V2 uses RandomX for one-time admission. Once activated, CPU speed cannot create extra consensus weight. Rabbit Core handles the official P2P bootstrap, node and miner automatically — no manual RPC, WebSocket or peer configuration is required to start mining.</p><div className="hero-ctas"><a className="button primary" href="#downloads">Download Rabbit Core <ArrowRight size={15} /></a><Link className="button secondary" to="/lcq">How LCQ works</Link></div></div><div className="terminal-card"><div className="terminal-head"><span>rabbit-core</span><b>WORK V2</b></div><pre><code><span>$</span> Start-Rabbit-Core.cmd{`\n\n`}<b>✓</b> encrypted wallet created locally{`\n`}<b>✓</b> P2P full node synchronized{`\n`}<b>✓</b> permissionless admission enabled{`\n`}<b>✓</b> persistent equal-seat LCQ loaded{`\n\n`}<em>Rabbit Core Testnet V2.1 ready_</em></code></pre></div></div></section>

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

      <section className="mining-flow-section"><div className="shell"><SectionHeader eyebrow="COMPLETE MINING FLOW" title="What happens from download to an active seat." /><div className="mining-steps"><article><span>01</span><Download size={21} /><h3>Download and verify</h3><p>Download the official Rabbit Core Testnet V2.1 package for your operating system and verify its SHA-256 before extracting it. On Windows PowerShell use <code>Get-FileHash .\rabbit-core-testnet-v2.1-windows-amd64.zip -Algorithm SHA256</code>. On Linux use <code>sha256sum rabbit-core-testnet-v2.1-linux-amd64.tar.gz</code>. The result must exactly match the SHA-256 displayed above.</p></article><article><span>02</span><HardDrive size={21} /><h3>Start, create and back up</h3><p>Windows: extract the ZIP and run <code>Start-Rabbit-Core.cmd</code>. Linux: extract the archive, optionally run <code>./rabbit-core --check</code>, then start with <code>./rabbit-core</code>. Rabbit Core creates an encrypted wallet locally. Back up the printed <code>UTC--...</code> keystore file and store its password separately.</p></article><article><span>03</span><Cpu size={21} /><h3>Synchronize the public chain</h3><p>Keep Rabbit Core open while it synchronizes. Rabbit Core automatically connects to the Rabbit Testnet P2P network; you do not need to configure an RPC, WebSocket endpoint or peer manually. Mining admission waits until the node has the canonical chain state it needs.</p></article><article><span>04</span><FileCheck2 size={21} /><h3>RandomX admission</h3><p>Work V2 admission is organized around canonical 128-block epochs. RandomX prepares a 1 GiB dataset and searches for the wallet's one-time admission proof. RandomX is used for admission — it does not give faster CPUs extra LCQ seats. After the proof is accepted, Rabbit Miner shows <code>LCQ PENDING</code> while the wallet waits for canonical selection and activation.</p></article><article><span>05</span><ShieldCheck size={21} /><h3>Wait for the active seat</h3><p>Admission and activation follow 128-block epoch boundaries, not a countdown from genesis. The familiar 128/256 sequence describes fresh-chain bootstrap; on the live testnet a new wallet follows the current canonical epochs. Depending on when it joins, the admission-to-activation path can cross roughly one to two epoch boundaries. <code>LCQ ACTIVE</code> / <code>ACTIVE LCQ seat</code> means the wallet now owns one equal persistent consensus seat.</p></article><article><span>06</span><TerminalSquare size={21} /><h3>You are mining</h3><p>When Rabbit Miner shows <code>LCQ ACTIVE</code> or <code>ACTIVE LCQ seat</code>, the wallet is actively participating in LCQ. Rabbit Miner shows every canonical block. A 🐇 <code>PRODUCER</code> line marks a block produced by your wallet; a 🥕 <code>COMMITTEE</code> line marks a committee reward detected for your wallet. The displayed balance is the mining wallet's current tRAB balance.</p></article></div></div></section>

      <section className="section shell"><div className="operator-split"><div><span className="section-kicker">WAITING IS EXPECTED</span><h2>Activation follows canonical height, not a local timer.</h2><p>If the network is paused or blocks arrive slowly, the relevant 128-block epoch boundaries also take longer. <code>LCQ PENDING</code> means the accepted wallet is waiting on canonical chain progress and selection; activation is never based on a local countdown.</p><p>If every producer disconnects, the chain pauses without resetting. After a two-minute canonical halt, permissionless recovery admission opens so any compatible non-zero wallet can submit a valid RandomX proof and resume the existing chain.</p></div><div className="operator-cards"><article><Cpu size={22} /><h3>Fair admission</h3><ul><li>One persistent seat per wallet</li><li>RandomX is one-time admission work</li><li>No recurring RandomX consensus weight</li><li>Faster CPUs cannot gain extra seats</li><li>Permissionless recovery</li></ul></article><article><TerminalSquare size={22} /><h3>Canonical rewards</h3><ul><li>Current block reward: 1.2 tRAB</li><li>70% producer: 0.84 tRAB</li><li>30% committee pool: 0.36 tRAB</li><li>The committee pool is shared among eligible committee participants</li><li>All payments are verified on-chain</li></ul></article></div></div></section>

      <section className="section shell"><div className="operator-split"><div><span className="section-kicker">READ THE MINER</span><h2>Know exactly when you are active.</h2><p><code>BLOCK #...</code> means Rabbit Core observed a new canonical block; it does not by itself mean your wallet earned that block. <code>LCQ PENDING</code> means admission was accepted and the wallet is waiting for canonical selection. <code>LCQ ACTIVE</code> / <code>ACTIVE LCQ seat</code> means the wallet has an active consensus seat and is mining in LCQ.</p></div><div className="operator-cards"><article><Cpu size={22} /><h3>Reward markers</h3><ul><li>🐇 PRODUCER — your wallet produced the block</li><li>🥕 COMMITTEE — Rabbit Miner detected a committee reward</li><li>Balance — current mining-wallet balance in tRAB</li><li>Blocks without a reward marker are normal</li></ul></article><article><TerminalSquare size={22} /><h3>Closing and reopening</h3><ul><li>Your wallet and blockchain data remain on disk</li><li>An active seat remains part of canonical state</li><li>On restart, Rabbit Core synchronizes any missing blocks</li><li>With the same wallet and data folder, restarting Rabbit Core does not repeat admission</li></ul></article></div></div></section>

      <section className="section shell"><SectionHeader eyebrow="WALLET AND DATA" title="Know exactly what to back up." /><div className="operator-cards"><article><MonitorDown size={22} /><h3>Windows</h3><p>Main folder: <code>%APPDATA%\RabbitChain\TestnetV2</code></p><p>Wallet: <code>keystore\UTC--...</code></p><p>Chain: <code>rabbit\chaindata</code></p><p>Log: <code>logs\rabbit-node.log</code></p></article><article><TerminalSquare size={22} /><h3>Linux</h3><p>Main folder: <code>${'${XDG_CONFIG_HOME:-$HOME/.config}'}/RabbitChain/TestnetV2</code></p><p>Wallet: <code>keystore/UTC--...</code></p><p>Chain: <code>rabbit/chaindata</code></p><p>Log: <code>logs/rabbit-node.log</code></p></article></div><p>The essential wallet backup is the <code>UTC--...</code> keystore file together with its password stored separately. Chain data can be synchronized again from the network. Never share a password, private key, seed phrase or keystore. The temporary <code>.rabbit-session-password-*</code> file is removed when Rabbit Core closes and is not a backup.</p></section>

      <section className="section shell"><div className="operator-split"><div><span className="section-kicker">MINER VS NODE</span><h2>Participation and infrastructure are related, but not identical.</h2><p>A miner participates in work and LCQ opportunities. A node can relay, query, index or expose infrastructure without being the same workflow.</p><Link className="inline-link" to="/nodes">Node operator guide <ArrowRight size={14} /></Link></div><div className="operator-cards"><article><Cpu size={22} /><h3>Miner</h3><ul><li>Valid work</li><li>Participant wallet</li><li>LCQ eligibility</li><li>Producer opportunities</li></ul></article><article><TerminalSquare size={22} /><h3>Node operator</h3><ul><li>P2P participation</li><li>Chain synchronization</li><li>RPC / infrastructure</li><li>Independent operation</li></ul></article></div></div></section>

      <section className="security-callout"><div className="shell"><ShieldCheck size={24} /><div><span>RELEASE SECURITY</span><h2>Never run a binary you cannot verify.</h2><p>Rabbit releases should be downloaded from official sources and matched against published hashes before use.</p></div><Link className="button light" to="/releases">Release center</Link></div></section>
    </main>
  )
}
