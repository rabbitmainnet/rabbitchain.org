import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, Download, FileCheck2, HardDrive, MonitorDown, ShieldCheck, TerminalSquare } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { DOWNLOADS, RELEASE } from '../config/release'

const icons = {
  'windows-amd64': MonitorDown,
  'linux-amd64': TerminalSquare,
}

export default function Mining() {
  const downloadsReady = RELEASE.downloadsLive && DOWNLOADS.length > 0

  return (
    <main>
      <section className="page-hero mining-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> PERMISSIONLESS TESTNET MINING</span>
            <h1>Download. Open. <em>Mine Rabbit.</em></h1>
            <p>
              Rabbit Core is the complete mining application. No MetaMask, Rabby,
              browser wallet, manual RPC, WebSocket, peer list or registration
              transaction is required to start mining.
            </p>

            <div className="hero-ctas">
              <a className="button primary" href="#downloads">
                Rabbit Core V2.2.3 <ArrowRight size={15} />
              </a>
              <Link className="button secondary" to="/lcq">How LCQ works</Link>
            </div>
          </div>

          <div className="terminal-card">
            <div className="terminal-head">
              <span>rabbit-core</span>
              <b>V2.2.3</b>
            </div>

            <pre><code>
              <span>$</span> Start-Rabbit-Core.cmd{`\n\n`}
              <b>✓</b> wallet created or reused automatically{`\n`}
              <b>✓</b> Rabbit Testnet connected automatically{`\n`}
              <b>✓</b> blockchain synchronized automatically{`\n`}
              <b>✓</b> LCQ admission handled automatically{`\n`}
              <b>✓</b> mining started{`\n\n`}
              <em>No manual configuration required_</em>
            </code></pre>
          </div>
        </div>
      </section>

      <section className="security-callout">
        <div className="shell">
          <ShieldCheck size={24} />

          <div>
            <span>URGENT TESTNET UPGRADE</span>
            <h2>Rabbit Core V2.2.3 is required before block 50,500.</h2>

            <p>
              Do not continue running Rabbit Core V2.2.2 through the stabilization
              fork. Existing miners only need to close the old Rabbit Core, extract
              V2.2.3 into a new folder and open it normally. Rabbit Core reuses the
              existing Rabbit Testnet data and mining wallet automatically.
              Do not delete your data directory, do not create another mining wallet
              and do not register again.
            </p>
          </div>

          <a className="button light" href="#downloads">V2.2.3 status</a>
        </div>
      </section>

      <section className="section shell" id="downloads">
        <SectionHeader
          eyebrow="RABBIT CORE V2.2.3"
          title="The only version for the block 50,500 stabilization fork."
          text="Use only the verified Rabbit Core V2.2.3 packages published by Rabbit Chain."
        />

        {downloadsReady ? (
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
                    <b>Testnet V2.2.3</b>

                    <small>SHA-256</small>
                    <code>{download.sha256}</code>
                  </div>

                  <a
                    className="button primary"
                    href={download.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={15} /> Download
                  </a>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="release-check-card">
            <FileCheck2 size={28} />
            <span>V2.2.3 REQUIRED</span>
            <strong>Windows + Linux packages are being finalized.</strong>

            <p>
              Do not download or continue using V2.2.2 past block 50,500.
              Verified V2.2.3 Windows and Linux downloads will appear here
              together as soon as both packages pass final verification.
            </p>

            <p>
              Existing miners: your Rabbit Testnet wallet, WorkSeat and chain data
              must be preserved. Do not delete your Rabbit data folder.
            </p>
          </div>
        )}
      </section>

      <section className="mining-flow-section">
        <div className="shell">
          <SectionHeader
            eyebrow="START MINING"
            title="Four steps. Rabbit Core handles everything else."
          />

          <div className="mining-steps">
            <article>
              <span>01</span>
              <Download size={21} />
              <h3>Download</h3>
              <p>
                Download the official Rabbit Core V2.2.3 package for Windows or Linux
                and verify the SHA-256 displayed on this page.
              </p>
            </article>

            <article>
              <span>02</span>
              <HardDrive size={21} />
              <h3>Extract and open</h3>
              <p>
                Windows: run <code>Start-Rabbit-Core.cmd</code>. Linux: run
                <code> ./Start-Rabbit-Core.sh</code>. No RPC, WebSocket, bootnode or
                peer configuration is required from the miner.
              </p>
            </article>

            <article>
              <span>03</span>
              <ShieldCheck size={21} />
              <h3>Create your password</h3>
              <p>
                On the first run Rabbit Core creates the encrypted mining wallet
                locally. On later runs it automatically reuses the existing wallet.
                Keep the password safe.
              </p>
            </article>

            <article>
              <span>04</span>
              <Cpu size={21} />
              <h3>Leave Rabbit Core running</h3>
              <p>
                Rabbit Core connects to the official P2P network, discovers peers and
                bootnodes, synchronizes the canonical chain, performs admission when
                needed and participates in LCQ automatically.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="operator-split">
          <div>
            <span className="section-kicker">ALREADY MINING?</span>
            <h2>Upgrade without touching your wallet.</h2>

            <p>
              Close the previous Rabbit Core application. Extract V2.2.3 into a new
              program folder and start it normally. Rabbit Core uses the existing
              Rabbit Testnet data directory and encrypted mining wallet.
            </p>

            <p>
              You do not need to connect a browser wallet, import a wallet into the
              website, send a registration transaction or perform admission again
              when the existing persistent seat is already present.
            </p>
          </div>

          <div className="operator-cards">
            <article>
              <ShieldCheck size={22} />
              <h3>Do not</h3>
              <ul>
                <li>Do not delete the Rabbit Testnet data directory</li>
                <li>Do not delete the keystore</li>
                <li>Do not create another mining wallet for the upgrade</li>
                <li>Do not register manually</li>
                <li>Do not configure a public RPC to mine</li>
              </ul>
            </article>

            <article>
              <Cpu size={22} />
              <h3>Rabbit Core does</h3>
              <ul>
                <li>Wallet creation and reuse</li>
                <li>Official P2P bootstrap</li>
                <li>Bootnode and peer discovery</li>
                <li>Canonical chain synchronization</li>
                <li>RandomX admission when required</li>
                <li>LCQ participation</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="operator-split">
          <div>
            <span className="section-kicker">WHAT YOU WILL SEE</span>
            <h2>Rabbit Miner tells you when you are active.</h2>

            <p>
              <code>LCQ PENDING</code> means the admission is accepted and the wallet
              is waiting for canonical activation. <code>LCQ ACTIVE</code> or
              <code> ACTIVE LCQ seat</code> means the mining wallet has an active
              consensus seat.
            </p>
          </div>

          <div className="operator-cards">
            <article>
              <Cpu size={22} />
              <h3>Rewards</h3>
              <ul>
                <li>🐇 PRODUCER — your wallet produced the block</li>
                <li>🥕 COMMITTEE — your wallet received committee reward</li>
                <li>Current block reward: 1.2 tRAB</li>
                <li>70% producer / 30% committee</li>
              </ul>
            </article>

            <article>
              <TerminalSquare size={22} />
              <h3>Fair participation</h3>
              <ul>
                <li>One persistent consensus seat per wallet</li>
                <li>RandomX is admission work</li>
                <li>CPU speed does not create extra LCQ seats</li>
                <li>Persistent WorkSeat survives normal restarts</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="security-callout">
        <div className="shell">
          <ShieldCheck size={24} />
          <div>
            <span>RELEASE SECURITY</span>
            <h2>Only run verified Rabbit Core packages.</h2>
            <p>
              Compare the downloaded archive SHA-256 with the value published by
              Rabbit Chain before extracting or running Rabbit Core.
            </p>
          </div>

          <Link className="button light" to="/releases">Release center</Link>
        </div>
      </section>
    </main>
  )
}
