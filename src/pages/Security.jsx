import { ArrowRight, CheckCircle2, Code2, FileCheck2, Globe2, KeyRound, LockKeyhole, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import StatusDot from '../components/StatusDot'

const rules=[
  [KeyRound,'Never share a seed phrase','RabbitChain.org does not need a seed phrase or private key to connect a wallet.'],
  [Wallet,'Connection is not a signature','Opening a wallet session alone should not require signing a message or transaction.'],
  [Globe2,'Verify the domain','Use rabbitchain.org and official project links before connecting or downloading software.'],
  [FileCheck2,'Verify releases','Official binaries should ship with versioned checksums and release notes.'],
  [Code2,'Inspect public source','Use the official Rabbit GitHub organization to verify source and repository history.'],
  [LockKeyhole,'Treat Testnet as testing','Testnet assets and services are experimental and must not be represented as production value.']
]

export default function Security(){return <main>
  <section className="page-hero security-page-hero"><div className="shell page-hero-grid"><div><StatusDot tone="tech">SECURITY CENTER</StatusDot><span className="page-kicker">VERIFY · CONNECT · DOWNLOAD</span><h1>Trust less.<br/><em>Verify more.</em></h1><p>Rabbit is permissionless infrastructure. The official portal should make wallet safety, network status, release verification and trusted project links easy to verify.</p><div className="hero-ctas"><a className="button primary" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">Official GitHub <ArrowRight size={15}/></a><Link className="button secondary" to="/status">Network status</Link></div></div><div className="security-trust-card"><ShieldCheck size={42}/><span>OFFICIAL WEB ORIGIN</span><strong>rabbitchain.org</strong><p>Wallet metadata, network setup and project links should resolve from the official domain or explicitly documented Rabbit infrastructure.</p><div><CheckCircle2 size={15}/>HTTPS required</div><div><CheckCircle2 size={15}/>No seed phrase requests</div><div><CheckCircle2 size={15}/>Status-aware services</div></div></div></section>

  <section className="page-section shell"><SectionHeader eyebrow="SAFETY BASELINE" title="Six rules every Rabbit user should see."/><div className="security-rule-grid">{rules.map(([Icon,title,text])=><article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div></section>

  <section className="security-release-section"><div className="shell"><SectionHeader eyebrow="RELEASE INTEGRITY" title="Downloads need provenance, not just a button." text="The release center is structured around version, platform, checksum and source."/><div className="release-integrity-grid"><article><span>01</span><h3>Official source</h3><p>Reach releases from RabbitChain.org or the official Rabbit GitHub organization.</p></article><article><span>02</span><h3>Version</h3><p>Know exactly which Testnet or Mainnet release you are running.</p></article><article><span>03</span><h3>SHA-256</h3><p>Compare the downloaded file hash against the value published with the release.</p></article><article><span>04</span><h3>Release notes</h3><p>Review network compatibility, required upgrades and known limitations.</p></article></div><Link className="button primary" to="/releases">Release center <ArrowRight size={15}/></Link></div></section>

  <section className="page-section shell"><div className="security-report-grid"><div><ShieldAlert/><span>RESPONSIBLE DISCLOSURE</span><h2>Security reporting should be explicit before public-value Mainnet.</h2><p>The project currently exposes its official GitHub organization as the public technical channel. A dedicated security advisory or bug-bounty channel should be published before Mainnet and then linked here without ambiguity.</p></div><div className="security-report-card"><small>CURRENT OFFICIAL TECHNICAL CHANNEL</small><a href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">github.com/rabbitmainnet <ArrowRight size={14}/></a><small>DO NOT</small><strong>Post private keys, seed phrases or exploit secrets in public issues.</strong></div></div></section>
</main>}
