import {
  Download,
  FileCheck2,
  HardDrive,
  MonitorDown,
  Network,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import {
  DOWNLOADS,
  RELEASE,
  TESTNET_BOOTNODES,
  TESTNET_ENDPOINTS,
} from '../config/release'

const icons = {
  'windows-amd64': MonitorDown,
  'linux-amd64': TerminalSquare,
  'darwin-amd64': MonitorDown,
  'darwin-arm64': MonitorDown,
}

export default function Releases() {
  const downloadsReady = RELEASE.downloadsLive && DOWNLOADS.length > 0

  return (
    <main>
      <style>{`
        .release-long-text {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: normal;
          line-height: 1.55;
        }

        .release-command {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: auto;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
          line-height: 1.55;
        }

        .download-grid > article,
        .operator-cards > article,
        .mining-steps > article {
          min-width: 0;
        }

        .download-meta {
          min-width: 0;
        }

        .download-meta code {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: normal;
        }

        @media (max-width: 720px) {
          .release-long-text,
          .release-command,
          .download-meta code {
            font-size: 0.78rem;
          }
        }
      `}</style>
      <section className="page-hero releases-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> OFFICIAL RABBIT CORE RELEASE</span>

            <h1>
              Rabbit Core Testnet V2.3.6 <em>current.</em>
            </h1>

            <p>
              V2.3.6 is the current Rabbit Core release for the public Rabbit Chain
              Testnet. This release refreshes the official P2P bootstrap infrastructure
              after the Rabbit Testnet servers were migrated. It does not reset the
              Testnet and does not introduce a new consensus activation.
            </p>

            <div className="hero-ctas">
              <a className="button primary" href="#downloads">
                <Download size={15} /> Download V2.3.6
              </a>

              <a
                className="button secondary"
                href={RELEASE.url}
                target="_blank"
                rel="noreferrer"
              >
                GitHub release
              </a>
            </div>
          </div>

          <div className="release-check-card">
            <FileCheck2 size={28} />

            <span>PUBLIC TESTNET V2.3.6</span>

            <strong>
              Windows + Linux + macOS verified packages
            </strong>

            <p>
              Source commit: <code>{RELEASE.commit}</code>
            </p>

            <p>
              Chain ID <b>{TESTNET_ENDPOINTS.chainId}</b> · Native test token{' '}
              <b>{TESTNET_ENDPOINTS.currency}</b>
            </p>
          </div>
        </div>
      </section>

      <section className="security-callout">
        <div className="shell">
          <ShieldCheck size={24} />

          <div>
            <span>SAFE IN-PLACE UPDATE</span>

            <h2>
              Existing miners must not delete their Rabbit Testnet data.
            </h2>

            <p>
              Close the previous Rabbit Core normally, extract V2.3.6 into a new
              program folder and start it normally. Keep your existing TestnetV2
              data directory, encrypted keystore, blockchain data and persistent
              participation state.
            </p>
          </div>

          <a className="button light" href="#upgrade">
            Upgrade safely
          </a>
        </div>
      </section>

      <section className="section shell" id="downloads">
        <SectionHeader
          eyebrow="OFFICIAL DOWNLOADS"
          title="Choose your operating system."
          text="Download only official Rabbit Core packages and verify the complete SHA-256 before extracting or running them."
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
                    <b>{RELEASE.requiredVersion}</b>

                    <small>SHA-256</small>
                    <code className="release-long-text">{download.sha256}</code>
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
            <strong>Use only packages published by Rabbit Chain.</strong>
          </div>
        )}
      </section>

      <section className="section shell" id="upgrade">
        <SectionHeader
          eyebrow="EXISTING MINERS"
          title="Upgrade without deleting your wallet or blockchain."
          text="V2.3.6 is designed as an in-place Rabbit Core software update. Your persistent Rabbit Testnet data remains in its normal data directory."
        />

        <div className="mining-steps">
          <article>
            <span>01</span>
            <TerminalSquare size={21} />
            <h3>Close Rabbit Core</h3>
            <p>
              Stop the current Rabbit Core normally. If using a terminal, use
              <code> Ctrl+C</code> and wait for the node to finish shutting down.
            </p>
          </article>

          <article>
            <span>02</span>
            <ShieldCheck size={21} />
            <h3>Keep TestnetV2</h3>
            <p>
              Do not delete your TestnetV2 data directory, encrypted keystore,
              blockchain database or persistent Rabbit participation state.
            </p>
          </article>

          <article>
            <span>03</span>
            <HardDrive size={21} />
            <h3>Extract V2.3.6</h3>
            <p>
              Extract the new release into a new program folder. The program files
              and your persistent Rabbit data directory are separate.
            </p>
          </article>

          <article>
            <span>04</span>
            <Network size={21} />
            <h3>Start normally</h3>
            <p>
              Rabbit Core reconnects to the Rabbit P2P network, verifies the
              canonical chain and resumes normal Testnet participation.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="NEW INSTALLATION"
          title="First time using Rabbit Core?"
          text="Rabbit Core handles the wallet, peer discovery, synchronization and LCQ participation from one package."
        />

        <div className="operator-cards">
          <article>
            <MonitorDown size={22} />
            <h3>Windows</h3>
            <p>
              Extract the ZIP and run <code>Start-Rabbit-Core.cmd</code>.
              On first run, Rabbit Core creates an encrypted mining wallet locally.
            </p>
          </article>

          <article>
            <TerminalSquare size={22} />
            <h3>Linux</h3>
            <p>
              Extract the TAR.GZ and run <code>./Start-Rabbit-Core.sh</code>.
              Keep your wallet password safe and back up the encrypted keystore.
            </p>
          </article>

          <article>
            <MonitorDown size={22} />
            <h3>macOS</h3>
            <p>
              Download the Intel/AMD64 or Apple Silicon/ARM64 package that matches
              your Mac and open <code>Start-Rabbit-Core.command</code>.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="VERIFY BEFORE RUNNING"
          title="Confirm the SHA-256 of your download."
          text="The calculated hash must match the SHA-256 printed on the download card above."
        />

        <div className="operator-cards">
          <article>
            <MonitorDown size={22} />
            <h3>Windows PowerShell</h3>
            <pre className="release-command"><code>Get-FileHash .\rabbit-core-testnet-v2.3.6-windows-amd64.zip -Algorithm SHA256</code></pre>
          </article>

          <article>
            <TerminalSquare size={22} />
            <h3>Linux</h3>
            <pre className="release-command"><code>sha256sum rabbit-core-testnet-v2.3.6-linux-amd64.tar.gz</code></pre>
          </article>

          <article>
            <TerminalSquare size={22} />
            <h3>macOS</h3>
            <pre className="release-command"><code>shasum -a 256 rabbit-core-testnet-v2.3.6-darwin-*.tar.gz</code></pre>
          </article>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="PUBLIC TESTNET"
          title="Official network endpoints."
          text="These are the public Rabbit Chain Testnet services used by wallets, developers, explorers and Rabbit Core."
        />

        <div className="operator-cards">
          <article>
            <Network size={22} />
            <h3>Network</h3>
            <ul>
              <li>Chain ID: <code>{TESTNET_ENDPOINTS.chainId}</code></li>
              <li>Currency: <code>{TESTNET_ENDPOINTS.currency}</code></li>
              <li>Network: Rabbit Chain Testnet</li>
            </ul>
          </article>

          <article>
            <TerminalSquare size={22} />
            <h3>RPC</h3>
            <ul>
              <li>HTTP: <code>{TESTNET_ENDPOINTS.rpc}</code></li>
              <li>WebSocket: <code>{TESTNET_ENDPOINTS.ws}</code></li>
            </ul>
          </article>

          <article>
            <MonitorDown size={22} />
            <h3>Explorer</h3>
            <p>
              <a
                href={TESTNET_ENDPOINTS.explorer}
                target="_blank"
                rel="noreferrer"
              >
                {TESTNET_ENDPOINTS.explorer}
              </a>
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="P2P DISCOVERY"
          title="Official Rabbit Testnet bootnodes."
          text="Bootnodes are peer-discovery entry points only. They do not control consensus, block production or miner selection."
        />

        <div className="operator-cards">
          {TESTNET_BOOTNODES.map((bootnode, index) => (
            <article key={bootnode}>
              <Network size={22} />
              <h3>Bootnode {index + 1}</h3>
              <code className="release-long-text">{bootnode}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="operator-split">
          <div>
            <span className="section-kicker">RELEASE SCOPE</span>
            <h2>V2.3.6 updates Rabbit Testnet bootstrap infrastructure.</h2>

            <p>
              The existing public Testnet chain is preserved. Liveness V4 remains
              active from block 97,991, and the previous Testnet consensus history
              remains unchanged.
            </p>

            <p>
              The V2.3.6 packages contain the current official Rabbit Testnet
              discovery nodes so new and existing nodes can reconnect to the
              public P2P mesh.
            </p>
          </div>

          <div className="operator-cards">
            <article>
              <FileCheck2 size={22} />
              <h3>Source identity</h3>
              <p>
                Release: <code>{RELEASE.tag}</code>
              </p>
              <p>
                Commit: <code className="release-long-text">{RELEASE.commit}</code>
              </p>
              <a href={RELEASE.url} target="_blank" rel="noreferrer">
                Open official GitHub release
              </a>
            </article>

            <article>
              <ShieldCheck size={22} />
              <h3>Protect your wallet</h3>
              <p>
                Never share your Rabbit Core wallet password, encrypted keystore
                file or private key. Public wallet addresses, block heights and
                peer counts are safe diagnostic information.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
