import { Download, FileCheck2, MonitorDown, TerminalSquare } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { DOWNLOADS, RELEASE } from '../config/release'

const icons = {
  'windows-amd64': MonitorDown,
  'linux-amd64': TerminalSquare,
}

export default function Releases() {
  const downloadsReady = RELEASE.downloadsLive && DOWNLOADS.length > 0

  return (
    <main>
      <section className="page-hero releases-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> OFFICIAL SOFTWARE</span>
            <h1>Rabbit Core Testnet V2.3.4 <em>current.</em></h1>

            <p>
              V2.3.4 is the current Rabbit Core release for the public Testnet. The
              block 77,000 Liveness V3 activation remains part of the preserved
              network history. Only use packages whose archive SHA-256 matches the
              value published by Rabbit Chain.
            </p>
          </div>

          <div className="release-check-card">
            <FileCheck2 size={28} />
            <span>PUBLIC TESTNET V2.3.4</span>
            <strong>
              {downloadsReady ? 'Windows + Linux verified' : 'Final package verification in progress'}
            </strong>

            <p>Source commit: <code>{RELEASE.commit}</code></p>

            {downloadsReady && (
              <a href={RELEASE.url} target="_blank" rel="noreferrer">
                Open official GitHub release
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="OFFICIAL DOWNLOADS"
          title="Rabbit Core V2.3.4"
          text="Rabbit Core V2.3.4 is the current verified public Testnet release."
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
            <span>CURRENT PUBLIC TESTNET RELEASE</span>
            <strong>Verified V2.3.4 Windows and Linux packages are available now.</strong>

            <p>
              The verified download buttons and SHA-256 values will appear here
              together when the public release is ready.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
