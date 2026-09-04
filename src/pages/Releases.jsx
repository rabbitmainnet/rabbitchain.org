import { Download, FileCheck2, MonitorDown, TerminalSquare } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { DOWNLOADS, RELEASE } from '../config/release'

const icons = {
  'windows-amd64': MonitorDown,
  'linux-amd64': TerminalSquare,
}

export default function Releases() {
  return (
    <main>
      <section className="page-hero releases-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> OFFICIAL SOFTWARE</span>
            <h1>Rabbit Core Testnet V2.1 is <em>ready to verify.</em></h1>
            <p>Official Windows and Linux packages built from the published V2.1 source commit, with archive and internal SHA-256 verification.</p>
          </div>
          <div className="release-check-card">
            <FileCheck2 size={28} />
            <span>PUBLIC TESTNET V2.1</span>
            <strong>Windows + Linux verified</strong>
            <p>Source commit: <code>{RELEASE.commit}</code></p>
            <a href={RELEASE.url} target="_blank" rel="noreferrer">Open official GitHub release</a>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="OFFICIAL DOWNLOADS"
          title="Download only from the Rabbit GitHub release."
          text="Verify the published SHA-256 before extracting or running Rabbit Core."
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
    </main>
  )
}
