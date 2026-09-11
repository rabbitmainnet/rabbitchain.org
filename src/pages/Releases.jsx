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
            <h1>Rabbit Core Testnet V2.2.3 <em>required.</em></h1>

            <p>
              V2.2.3 is the required Rabbit Core release for the stabilization fork
              at block 50,500. Only use packages whose archive SHA-256 matches the
              value published by Rabbit Chain.
            </p>
          </div>

          <div className="release-check-card">
            <FileCheck2 size={28} />
            <span>PUBLIC TESTNET V2.2.3</span>
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
          title="Rabbit Core V2.2.3"
          text="Never use an older Rabbit Core release past the block 50,500 stabilization fork."
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
            <span>DO NOT USE V2.2.2 PAST BLOCK 50,500</span>
            <strong>V2.2.3 Windows + Linux downloads are being finalized.</strong>

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
