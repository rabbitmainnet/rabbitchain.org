import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, FileText, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

const WHITEPAPER_REPO = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper'
const WHITEPAPER_PDF = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper/blob/main/docs/Rabbit-Chain-Whitepaper-v1.5.pdf'
const STABILIZATION_REPORT = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper/blob/main/docs/Testnet-V2.2.3-Stabilization-Report.md'
const FAIRNESS_REPORT = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper/blob/main/docs/Testnet-V2.2.5-Fairness-Liveness-Upgrade.md'
const LIVENESS_V3_REPORT = 'https://github.com/rabbitmainnet/rabbit-chain-whitepaper/blob/main/docs/Testnet-V2.3.0-Liveness-V3-Upgrade.md'
const CORE_RELEASE = 'https://github.com/rabbitmainnet/rabbit-geth/releases/tag/rabbit-core-testnet-v2.3.0'

export default function Whitepaper() {
  return (
    <main>
      <section className="page-hero whitepaper-hero">
        <div className="shell page-hero-grid">
          <div className="page-hero-copy">
            <span className="hero-eyebrow"><i /> OFFICIAL TECHNICAL WHITEPAPER · v1.5</span>
            <h1>Public Testnet V2 <em>Liveness V3 Edition.</em></h1>
            <p>
              Rabbit Chain is a permissionless, EVM-compatible Layer 1 built around
              Live Consensus Queue (LCQ). Work qualifies participation; canonical
              eligible wallets receive at most one WorkSeat per epoch, and the
              deterministic LCQ queue schedules block production.
            </p>

            <div className="hero-ctas">
              <a className="button primary" href={WHITEPAPER_PDF} target="_blank" rel="noreferrer">
                Whitepaper PDF v1.5 <ArrowUpRight size={14} />
              </a>
              <a className="button secondary" href={WHITEPAPER_REPO} target="_blank" rel="noreferrer">
                Source repository <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          <div className="whitepaper-card">
            <div><img src="/rabbit-mark.png" alt="" /><span>RABBIT CHAIN</span></div>
            <strong>Technical Whitepaper v1.5</strong>
            <p>16 September 2026 · Rabbit Core Testnet V2.3.0</p>
            <section>
              <span>CHAIN ID 9280</span>
              <span>LCQ CONSENSUS</span>
              <span>WORK V2</span>
              <span>EVM</span>
            </section>
          </div>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="CURRENT RELEASED NETWORK"
          title="The site and the whitepaper now use the same Testnet identity."
          text="These values are copied from the current v1.5 whitepaper and the Rabbit Core V2.3.0 Liveness V3 release record."
        />

        <div className="resource-grid">
          <article>
            <BookOpen size={22} />
            <span>RELEASE</span>
            <h3>Rabbit Core V2.3.0</h3>
            <p>
              Source commit:<br />
              <code style={{ wordBreak: 'break-all' }}>
                7128cb6db44dbecff608a54b4890a03f5e426647
              </code>
            </p>
            <p>
              Consensus hardening: block 50,000.<br />
              Consensus stabilization: block 50,500.<br />
               Fairness/Liveness: block 73,000.<br />
                Liveness V3: block 77,000.
            </p>
            <a href={CORE_RELEASE} target="_blank" rel="noreferrer">
              Official release <ArrowUpRight size={14} />
            </a>
          </article>

          <article>
            <FileText size={22} />
            <span>NETWORK</span>
            <h3>Rabbit Testnet V2</h3>
            <p>
              Chain ID: 9280.<br />
              Network ID: 9280.<br />
              Native test asset: tRAB.<br />
              Execution: EVM.
            </p>
            <p>
              Genesis SHA-256:<br />
              <code style={{ wordBreak: 'break-all' }}>
                1e3dbb01317c0f89f7865576caca906cd29a6afd9a726639ea1452cb92ab1a61
              </code>
            </p>
          </article>

          <article>
            <ShieldCheck size={22} />
            <span>VERIFIED PACKAGES</span>
            <h3>Rabbit Core V2.3.0</h3>
            <p>
              Windows AMD64 SHA-256:<br />
              <code style={{ wordBreak: 'break-all' }}>
                a23662ee6def886b62336ce0dedd5b0d6bf8daeb0cb12cc96eadae435c12ab0e
              </code>
            </p>
            <p>
              Linux AMD64 SHA-256:<br />
              <code style={{ wordBreak: 'break-all' }}>
                e5d75d1b3c71b31420a1999043a369f661bea794afc4aaefdff5e157262ec2ad
              </code>
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="LCQ CONSENSUS"
          title="Work admission and deterministic block production are separate."
          text="RandomX-backed Work V2 qualifies a wallet for canonical participation. LCQ then derives the eligible set and deterministic production queue from canonical history."
        />

        <div className="resource-grid">
          <article>
            <BookOpen size={22} />
            <span>FAIRNESS INVARIANT</span>
            <h3>One wallet, one canonical seat</h3>
            <p>
              A participant wallet can hold at most one canonical WorkSeat in the
              relevant epoch. Multiple processes using the same wallet may provide
              redundancy, but must not multiply that wallet's canonical queue seats.
            </p>
            <p>
              This is wallet-bounded fairness, not a claim of unique-human identity.
            </p>
          </article>

          <article>
            <FileText size={22} />
            <span>REWARDS</span>
            <h3>70% producer · 30% committee</h3>
            <p>
              Each canonical block divides the configured protocol reward between
              the scheduled producer and the eligible committee: 70% to the producer
              and 30% to the committee.
            </p>
          </article>

          <article>
            <ShieldCheck size={22} />
            <span>LIVENESS</span>
            <h3>Preserved canonical history</h3>
            <p>
              If participation falls to zero, the chain may wait instead of creating
              synthetic work or appointing a trusted emergency producer. Recovery
              resumes from preserved canonical state when valid participation returns.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="CURRENT V2.3.0 LIVENESS V3 RECORD"
          title="Liveness V3 activation at block 77,000."
          text="The public upgrade record documents the V2.3.0 release identity, verified Windows and Linux packages, deterministic producer rotation, fallback recovery, committee participation and the preserved in-place upgrade path."
        />

        <div className="hero-ctas">
          <a className="button primary" href={LIVENESS_V3_REPORT} target="_blank" rel="noreferrer">
            Read Liveness V3 record <ArrowUpRight size={14} />
          </a>
          <a className="button secondary" href={FAIRNESS_REPORT} target="_blank" rel="noreferrer">
            Historical V2.2.5 record <ArrowUpRight size={14} />
          </a>
          <a className="button secondary" href={CORE_RELEASE} target="_blank" rel="noreferrer">
            Rabbit Core V2.3.0 release <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="HISTORICAL V2.2.3 STABILIZATION RECORD"
          title="The stabilization report includes both the recovery evidence and the transients."
          text="The public record does not hide the convergence period around the block-50,500 activation."
        />

        <div className="resource-grid">
          <article>
            <BookOpen size={22} />
            <span>IN-PLACE UPGRADE</span>
            <h3>No Testnet reset</h3>
            <p>
              V2.2.3 was validated as an in-place upgrade: the existing wallet,
              datadir, canonical history and persistent WorkSeat were preserved while
              the node rebuilt canonical LCQ state, synchronized and resumed participation.
            </p>
          </article>

          <article>
            <FileText size={22} />
            <span>OBSERVED TRANSIENTS</span>
            <h3>Documented, not hidden</h3>
            <p>
              During convergence, two 120-second block intervals were observed around
              blocks 50,561 and 50,562. At block 50,562 the network also applied a
              deterministic one-block fork recovery/reorganization.
            </p>
          </article>

          <article>
            <ShieldCheck size={22} />
            <span>POST-STABILIZATION</span>
            <h3>Canonical convergence</h3>
            <p>
              A later 40-block sample measured 10.22 seconds mean, 10 seconds median
              and 13 seconds maximum, with no interval above 20 seconds. RPC and
              Explorer later matched at block 50,698 on the same canonical hash.
            </p>
          </article>
        </div>

        <div className="hero-ctas">
          <a className="button primary" href={STABILIZATION_REPORT} target="_blank" rel="noreferrer">
            Read stabilization report <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      <section className="section shell">
        <SectionHeader
          eyebrow="KNOWN TESTNET LIMITATION"
          title="Rabbit-specific fork activation is not yet encoded in EIP-2124 ForkID."
          text="The current Testnet implementation can leave an older client connected at the P2P transport layer after a Rabbit-specific activation even though upgraded consensus rejects its incompatible blocks. Rabbit-specific ForkID enforcement and mixed-version regression tests are required before Mainnet."
        />

        <div className="hero-ctas">
          <a className="button primary" href={WHITEPAPER_PDF} target="_blank" rel="noreferrer">
            Read the full v1.5 paper <ArrowUpRight size={14} />
          </a>
          <Link className="button secondary" to="/docs">
            Explore Docs <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
