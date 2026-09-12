import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, FileText, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

const WHITEPAPER_PDF = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper/blob/main/docs/Rabbit-Chain-Whitepaper-v1.3.pdf'
const WHITEPAPER_REPO = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper'
const STABILIZATION_REPORT = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper/blob/main/docs/Testnet-V2.2.3-Stabilization-Report.md'

export default function Whitepaper() {
  return (
    <main>
      <section className="page-hero whitepaper-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> OFFICIAL PROTOCOL PAPER · v1.3</span>
            <h1>The protocol, <em>documented transparently.</em></h1>
            <p>Rabbit Chain Technical Whitepaper v1.3 documents the live Public Testnet V2, Rabbit Core V2.2.3, LCQ, Work V2, the block 50,000 consensus hardening, block 50,500 stabilization, economics, validation evidence and known limitations.</p>
            <div className="hero-ctas">
              <a className="button primary" href={WHITEPAPER_PDF} target="_blank" rel="noreferrer">Read Whitepaper v1.3 <ArrowUpRight size={14} /></a>
              <a className="button secondary" href={WHITEPAPER_REPO} target="_blank" rel="noreferrer">GitHub repository <ArrowUpRight size={14} /></a>
            </div>
          </div>

          <div className="whitepaper-card">
            <div><img src="/rabbit-mark.png" alt="" /><span>RABBIT CHAIN</span></div>
            <strong>Technical Whitepaper v1.3</strong>
            <p>Public Testnet V2 · Rabbit Core V2.2.3 post-stabilization</p>
            <section>
              <span>CHAIN 9280</span>
              <span>LCQ CONSENSUS</span>
              <span>BLOCK 50,500 ACTIVE</span>
              <span>EIP-2124 DISCLOSED</span>
            </section>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader eyebrow="CURRENT TESTNET IDENTITY" title="Aligned with the live Rabbit Core V2.2.3 network." text="The current whitepaper records the release identity, stabilization fork, verified artifacts, observed post-fork evidence and known compatibility limitations." />

        <div className="resource-grid">
          <article>
            <BookOpen size={22} />
            <span>NETWORK</span>
            <h3>Rabbit Testnet V2</h3>
            <p>Chain ID / Network ID: 9280 / 9280.<br />Native test asset: tRAB.<br />Hardening: block 50,000.<br />Stabilization: block 50,500.</p>
            <p>Genesis SHA-256:<br /><code style={{ wordBreak: 'break-all' }}>ab66857a5b28da355ff270ced29176ac151e70e8281dbad8fc8d24a2192fc71b</code></p>
          </article>

          <article>
            <FileText size={22} />
            <span>RELEASE</span>
            <h3>Rabbit Core V2.2.3</h3>
            <p>Source commit:<br /><code style={{ wordBreak: 'break-all' }}>42ed7d943bad9143d23ae821d6d23c332b46e1b7</code></p>
            <p>Windows SHA-256:<br /><code style={{ wordBreak: 'break-all' }}>6cb9335cb412f86bfe7ff02fb01488ee231e5e9bde9788edf27f49a117719fbb</code></p>
            <p>Linux SHA-256:<br /><code style={{ wordBreak: 'break-all' }}>3152fca57f91d7128f01f5e143d6c0accadfead86b173129c4f20c9e378cf4e4</code></p>
          </article>

          <article>
            <ShieldCheck size={22} />
            <span>POST-STABILIZATION</span>
            <h3>Canonical convergence verified</h3>
            <p>RPC and Explorer crossed block 50,500 on the same canonical chain. At block 50,698 both returned the same canonical block hash.</p>
            <p>A later 40-block sample measured 10.22-second mean, 10-second median, 13-second maximum and no interval above 20 seconds.</p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader eyebrow="KNOWN LIMITATION" title="EIP-2124 ForkID compatibility is disclosed." text="Rabbit-specific activation heights under LQCConfig are not currently encoded into the advertised EIP-2124 ForkID. Older clients may therefore remain P2P-connected even though upgraded V2.2.3 consensus rejects incompatible blocks. Rabbit-specific ForkID enforcement and mixed-version regression tests are required before Mainnet." />
        <div className="hero-ctas">
          <a className="button primary" href={STABILIZATION_REPORT} target="_blank" rel="noreferrer">Stabilization report <ArrowUpRight size={14} /></a>
          <Link className="button secondary" to="/docs">Explore Docs <ArrowRight size={14} /></Link>
        </div>
      </section>
    </main>
  )
}
