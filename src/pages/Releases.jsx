import { ArrowRight, CheckCircle2, Download, FileCheck2, MonitorDown, ShieldCheck, TerminalSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import StatusDot from '../components/StatusDot'
import { RELEASE } from '../config/release'

const targets=[
  ['Windows','x86_64','ZIP / executable',MonitorDown],
  ['Linux / Ubuntu','x86_64','tar.gz / executable',TerminalSquare],
  ['macOS','ARM64 / x86_64','signed release track',MonitorDown]
]

export default function Releases(){return <main>
  <section className="page-hero releases-page-hero"><div className="shell page-hero-grid"><div><StatusDot tone="launch">OFFICIAL SOFTWARE</StatusDot><span className="page-kicker">RELEASES · BINARIES · CHECKSUMS</span><h1>Download Rabbit from <em>one trusted path.</em></h1><p>The release center separates published software from planned targets. A download is not considered official until its version, source and checksum are visible together.</p><div className="hero-ctas"><a className="button primary" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">Official GitHub <ArrowRight size={15}/></a><Link className="button secondary" to="/security">Verify safely</Link></div></div><div className="release-hero-card"><div><FileCheck2/><span>PUBLIC RELEASE STATE</span></div><strong>{RELEASE.downloadsLive?'DOWNLOADS LIVE':'TESTNET BINARIES NOT YET PUBLIC'}</strong><p>{RELEASE.downloadsLive?'Use the release table below and verify every checksum before execution.':'The portal is ready for platform-specific binaries, but does not expose placeholder files as downloads.'}</p></div></div></section>

  <section className="page-section shell"><SectionHeader eyebrow="SUPPORTED TARGETS" title="Release slots for the systems Rabbit intends to support." text="Buttons remain disabled until a real public artifact and checksum exist."/><div className="release-target-grid">{targets.map(([name,arch,format,Icon])=><article key={name}><Icon/><span>{arch}</span><h3>{name}</h3><p>{format}</p><div><small>VERSION</small><b>{RELEASE.downloadsLive?'See published release':'Pending Testnet release'}</b><small>SHA-256</small><b>{RELEASE.downloadsLive?'Published beside artifact':'Published with artifact'}</b></div><button disabled={!RELEASE.downloadsLive}><Download size={15}/>{RELEASE.downloadsLive?'Download':'Coming with public release'}</button></article>)}</div></section>

  <section className="release-process"><div className="shell"><SectionHeader eyebrow="VERIFY BEFORE RUNNING" title="A four-step release discipline."/><div className="release-process-grid"><article><span>01</span><h3>Open the official release</h3><p>Start from RabbitChain.org or the official Rabbit GitHub organization.</p></article><article><span>02</span><h3>Check network compatibility</h3><p>Confirm whether the build targets Testnet or Mainnet and review upgrade notes.</p></article><article><span>03</span><h3>Verify SHA-256</h3><p>Hash the downloaded file locally and compare it with the published checksum.</p></article><article><span>04</span><h3>Run clean</h3><p>Use a fresh data directory for a new public network instead of reusing lab state.</p></article></div></div></section>

  <section className="page-section shell"><div className="release-policy-card"><ShieldCheck/><div><span>RELEASE POLICY</span><h2>Source, binary and network configuration must agree.</h2><p>Production releases should be traceable to reviewed source, accompanied by hashes and paired with deliberately finalized network configuration.</p></div><Link to="/mining">Mining workflow <ArrowRight size={15}/></Link></div></section>
</main>}
