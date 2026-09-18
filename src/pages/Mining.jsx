import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Cpu,
  Download,
  FileCheck2,
  HardDrive,
  MonitorDown,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { DOWNLOADS, RELEASE } from '../config/release'

const icons = {
  'windows-amd64': MonitorDown,
  'linux-amd64': TerminalSquare,
  'darwin-amd64': MonitorDown,
  'darwin-arm64': MonitorDown,
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
              Rabbit Core is the complete Rabbit Chain mining application. No MetaMask,
              Rabby, browser wallet, manual RPC, WebSocket, peer list or registration
              transaction is required to start mining.
            </p>

            <div className="hero-ctas">
              <a className="button primary" href="#downloads">
                Rabbit Core V2.3.4 <ArrowRight size={15} />
              </a>
              <Link className="button secondary" to="/lcq">How LCQ works</Link>
            </div>
          </div>

          <div className="terminal-card">
            <div className="terminal-head">
              <span>rabbit-core</span>
              <b>V2.3.4</b>
            </div>

            <pre><code>
              <span>$</span> Start-Rabbit-Core.cmd{`\n\n`}
              <b>✓</b> wallet created or reused automatically{`\n`}
              <b>✓</b> official Rabbit Testnet connected{`\n`}
              <b>✓</b> canonical blockchain synchronized{`\n`}
              <b>✓</b> LCQ admission handled automatically{`\n`}
              <b>✓</b> mining and committee participation started{`\n\n`}
              <em>No manual RPC or consensus configuration required_</em>
            </code></pre>
          </div>
        </div>
      </section>

      <section className="security-callout">
        <div className="shell">
          <ShieldCheck size={24} />

          <div>
            <span>CURRENT TESTNET RELEASE</span>
            <h2>Rabbit Core V2.3.4 is the current public Testnet package.</h2>

            <p>
              Existing miners only need to close the previous Rabbit Core, extract
              the new package into a new program folder and open it normally. Rabbit
              Core reuses the persistent Rabbit Testnet data directory and encrypted
              mining wallet automatically.
            </p>
          </div>

          <a className="button light" href="#downloads">Download V2.3.4</a>
        </div>
      </section>

      <section className="section shell" id="downloads">
        <SectionHeader
          eyebrow="RABBIT CORE V2.3.4"
          title="Official verified Testnet packages."
          text="Use only Rabbit Core packages published by Rabbit Chain. Verify the SHA-256 before extracting or running the archive."
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
                    <b>Testnet V2.3.4</b>

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
            <span>DOWNLOADS TEMPORARILY UNAVAILABLE</span>
            <strong>Use only packages published on this page.</strong>
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
                Download the official package for Windows, Linux, macOS Intel or
                macOS Apple Silicon and compare its SHA-256 with the value displayed above.
              </p>
            </article>

            <article>
              <span>02</span>
              <HardDrive size={21} />
              <h3>Extract and open</h3>
              <p>
                Windows: run <code>Start-Rabbit-Core.cmd</code>. Linux: run
                <code> ./Start-Rabbit-Core.sh</code>. macOS: open
                <code> Start-Rabbit-Core.command</code> from the package matching
                your Mac architecture. Keep the extracted program folder separate
                from your persistent Rabbit data directory.
              </p>
            </article>

            <article>
              <span>03</span>
              <ShieldCheck size={21} />
              <h3>Create your password</h3>
              <p>
                On first run Rabbit Core creates an encrypted mining wallet locally.
                Keep the password safe and back up the exact encrypted keystore file.
              </p>
            </article>

            <article>
              <span>04</span>
              <Cpu size={21} />
              <h3>Leave Rabbit Core running</h3>
              <p>
                Rabbit Core connects to the P2P network, discovers peers,
                synchronizes the canonical chain, performs admission when required
                and participates in LCQ automatically.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell" id="data-location">
        <style>{`
          .rabbit-storage-platforms {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 32px;
            align-items: start;
          }

          .rabbit-storage-platform {
            min-width: 0;
          }

          .rabbit-storage-platform h2 {
            font-size: clamp(2rem, 3vw, 3.35rem);
            line-height: 1.02;
            margin-bottom: 18px;
          }

          .rabbit-storage-lead {
            min-width: 0;
            margin-bottom: 18px;
          }

          .rabbit-storage-lead code,
          .rabbit-storage-paths code {
            display: block;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            white-space: normal;
            overflow-wrap: anywhere;
            word-break: break-word;
            line-height: 1.55;
          }

          .rabbit-storage-paths {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .rabbit-storage-paths article {
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
          }

          .rabbit-storage-paths p {
            min-width: 0;
            max-width: 100%;
          }

          @media (max-width: 900px) {
            .rabbit-storage-platforms {
              grid-template-columns: 1fr;
            }

            .rabbit-storage-platform h2 {
              font-size: clamp(1.9rem, 8vw, 2.8rem);
            }
          }
        `}</style>

        <SectionHeader
          eyebrow="YOUR FILES"
          title="Where Rabbit Core stores your wallet, blockchain and logs."
          text="The program can be extracted anywhere. Your persistent Rabbit Testnet data is stored separately in your operating-system user configuration directory."
        />

        <div className="rabbit-storage-platforms">
          <div className="rabbit-storage-platform">
            <span className="section-kicker">WINDOWS</span>
            <h2>Your Rabbit data is in AppData.</h2>

            <div className="rabbit-storage-lead">
              <p>Main directory:</p>
              <code>%APPDATA%\RabbitChain\TestnetV2</code>
            </div>

            <div className="rabbit-storage-lead">
              <p>Typical full path:</p>
              <code>C:\Users\&lt;USER&gt;\AppData\Roaming\RabbitChain\TestnetV2</code>
            </div>

            <div className="operator-cards rabbit-storage-paths">
              <article>
                <ShieldCheck size={22} />
                <h3>Encrypted wallet</h3>
                <code>%APPDATA%\RabbitChain\TestnetV2\keystore\UTC--...</code>
              </article>

              <article>
                <HardDrive size={22} />
                <h3>Blockchain</h3>
                <code>%APPDATA%\RabbitChain\TestnetV2\rabbit\chaindata</code>
              </article>

              <article>
                <TerminalSquare size={22} />
                <h3>Node log</h3>
                <code>%APPDATA%\RabbitChain\TestnetV2\logs\rabbit-node.log</code>
              </article>
            </div>
          </div>

          <div className="rabbit-storage-platform">
            <span className="section-kicker">LINUX</span>
            <h2>Your Rabbit data is in your user config directory.</h2>

            <div className="rabbit-storage-lead">
              <p>Main directory:</p>
              <code>${'{'}XDG_CONFIG_HOME:-$HOME/.config{'}'}/RabbitChain/TestnetV2</code>
            </div>

            <div className="rabbit-storage-lead">
              <p>Default full path:</p>
              <code>$HOME/.config/RabbitChain/TestnetV2</code>
            </div>

            <div className="operator-cards rabbit-storage-paths">
              <article>
                <ShieldCheck size={22} />
                <h3>Encrypted wallet</h3>
                <code>$HOME/.config/RabbitChain/TestnetV2/keystore/UTC--...</code>
              </article>

              <article>
                <HardDrive size={22} />
                <h3>Blockchain</h3>
                <code>$HOME/.config/RabbitChain/TestnetV2/rabbit/chaindata</code>
              </article>

              <article>
                <TerminalSquare size={22} />
                <h3>Node log</h3>
                <code>$HOME/.config/RabbitChain/TestnetV2/logs/rabbit-node.log</code>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="security-callout">
        <div className="shell">
          <ShieldCheck size={24} />

          <div>
            <span>BACK UP YOUR MINING WALLET</span>
            <h2>The keystore file and its password are what you must protect.</h2>

            <p>
              Back up the exact <code>UTC--...</code> file from the
              <code> keystore</code> directory and store its password separately.
              Never send the keystore file or password to support, Discord, social
              media or another person. The temporary
              <code> .rabbit-session-password-*</code> file is not a wallet backup
              and is removed automatically when the session ends.
            </p>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="operator-split">
          <div>
            <span className="section-kicker">UPGRADE OR MOVE TO ANOTHER PC</span>
            <h2>Keep the same wallet.</h2>

            <p>
              For a normal upgrade, close Rabbit Core safely, extract the new program
              package into a new folder and start it. Do not delete the persistent
              Testnet data directory or create another mining wallet.
            </p>

            <p>
              To move the mining identity to another computer, first stop Rabbit Core
              cleanly. Copy the encrypted <code>UTC--...</code> keystore file and keep
              its password separately. Preserving the complete Rabbit data directory
              can avoid downloading and validating the full chain again.
            </p>
          </div>

          <div className="operator-cards">
            <article>
              <ShieldCheck size={22} />
              <h3>Never delete</h3>
              <ul>
                <li>Your <code>keystore</code> when you want to keep the wallet</li>
                <li>Your wallet password</li>
                <li>Your backup of the encrypted <code>UTC--...</code> file</li>
              </ul>
            </article>

            <article>
              <Cpu size={22} />
              <h3>Rabbit Core handles</h3>
              <ul>
                <li>Wallet creation and reuse</li>
                <li>Official P2P bootstrap and peer discovery</li>
                <li>Canonical chain synchronization</li>
                <li>RandomX admission when required</li>
                <li>LCQ producer and committee participation</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="operator-split">
          <div>
            <span className="section-kicker">NORMAL OPERATION</span>
            <h2>Keep Rabbit Core open while mining.</h2>

            <p>
              Closing Rabbit Core does not erase a canonical persistent seat. Restart
              with the same wallet and data directory. When stopping manually, use
              <code> Ctrl+C</code> and wait for Rabbit Core to finish its safe
              shutdown before closing the terminal or turning off the computer.
            </p>

            <p>
              If the network has no reachable peers, production pauses rather than
              creating an isolated private chain. When connectivity returns, Rabbit
              Core verifies the canonical chain before normal participation resumes.
            </p>
          </div>

          <div className="operator-cards">
            <article>
              <Cpu size={22} />
              <h3>Mining status</h3>
              <ul>
                <li><code>LCQ PENDING</code> — admission accepted, activation pending</li>
                <li><code>LCQ ACTIVE</code> — wallet has an active consensus seat</li>
                <li>🐇 PRODUCER — wallet produced the canonical block</li>
                <li>🥕 COMMITTEE — wallet received committee reward</li>
              </ul>
            </article>

            <article>
              <TerminalSquare size={22} />
              <h3>Fair participation</h3>
              <ul>
                <li>One persistent consensus seat per wallet</li>
                <li>RandomX is admission work, not a permanent speed race</li>
                <li>CPU speed does not create extra LCQ seats</li>
                <li>Persistent WorkSeat survives normal restarts</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="RECOVERY & SUPPORT"
          title="Know what is safe to rebuild and what must never be lost."
          text="The blockchain database is reproducible from the network. Your encrypted wallet is not."
        />

        <div className="operator-cards">
          <article>
            <HardDrive size={22} />
            <h3>Local chain recovery</h3>
            <p>
              Rabbit Core V2.3.4 preserves the existing Rabbit Testnet blockchain data,
              encrypted wallet and persistent consensus state across normal restarts.
              If the node stops unexpectedly, Rabbit Core restarts it using the same
              data directory and waits for canonical synchronization before mining resumes.
            </p>
          </article>

          <article>
            <TerminalSquare size={22} />
            <h3>If you need the node log</h3>
            <p>
              Windows:
              {' '}
              <code>%APPDATA%\RabbitChain\TestnetV2\logs\rabbit-node.log</code>
            </p>
            <p>
              Linux:
              {' '}
              <code>.../RabbitChain/TestnetV2/logs/rabbit-node.log</code>
            </p>
          </article>

          <article>
            <ShieldCheck size={22} />
            <h3>Safe support information</h3>
            <p>
              You may share your operating system, Rabbit Git commit, public wallet
              address, block heights, peer count, synchronization status and a
              sanitized error. Never share the wallet password or encrypted keystore
              file.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <div className="operator-split">
          <div>
            <span className="section-kicker">REWARDS</span>
            <h2>Producer and committee rewards are visible in Rabbit Miner.</h2>

            <p>
              The current Testnet block reward is 1.2 tRAB. The protocol allocates
              70% to the selected producer and 30% to the eligible committee.
            </p>
          </div>

          <div className="operator-cards">
            <article>
              <Cpu size={22} />
              <h3>Current split</h3>
              <ul>
                <li>🐇 Producer: 0.84 tRAB</li>
                <li>🥕 Committee: 0.36 tRAB total</li>
                <li>Displayed balance updates as canonical rewards arrive</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="security-callout">
        <div className="shell">
          <FileCheck2 size={24} />
          <div>
            <span>RELEASE SECURITY</span>
            <h2>Verify the package before running it.</h2>
            <p>
              Compare the downloaded archive SHA-256 with this page. Rabbit Core also
              includes internal checksums and validates the official Testnet genesis
              and chain ID before normal operation.
            </p>
          </div>

          <Link className="button light" to="/releases">Release center</Link>
        </div>
      </section>
    </main>
  )
}
