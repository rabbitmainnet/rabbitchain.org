import { ArrowRight, BookOpen, FileText, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusDot from '../components/StatusDot'
import SectionHeader from '../components/SectionHeader'

export default function Whitepaper(){
  return <main>
    <section className="page-hero">
      <div className="shell page-hero-grid">
        <div>
          <StatusDot tone="tech">TECHNICAL PAPER · IN PREPARATION</StatusDot>

          <span className="page-kicker">RABBIT CHAIN WHITEPAPER</span>

          <h1>
            The protocol,
            <br/>
            <em>documented properly.</em>
          </h1>

          <p>
            The Rabbit Chain Whitepaper will document LCQ Consensus,
            network architecture, mining, eligibility, block production,
            security, economics and the path from public Testnet to Mainnet.
          </p>

          <div className="hero-ctas">
            <button className="button primary" disabled>
              Read Whitepaper
              <ArrowRight size={15}/>
            </button>

            <Link className="button secondary" to="/docs">
              Explore Docs
            </Link>
          </div>
        </div>

        <div className="network-detail-card">
          <div className="network-detail-top">
            <img src="/rabbit-mark.png" alt="Rabbit Chain"/>
            <div>
              <span>RABBIT CHAIN</span>
              <b>WHITEPAPER</b>
            </div>
            <StatusDot>IN PREPARATION</StatusDot>
          </div>

          <div className="network-detail-grid">
            <div>
              <span>FORMAT</span>
              <strong>Technical</strong>
            </div>

            <div>
              <span>CONSENSUS</span>
              <strong>LCQ</strong>
            </div>

            <div>
              <span>TESTNET</span>
              <strong>9280</strong>
            </div>

            <div>
              <span>MAINNET</span>
              <strong>928</strong>
            </div>

            <div>
              <span>VERSION</span>
              <strong>Preparing</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong>Drafting</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="page-section shell">
      <SectionHeader
        eyebrow="WHITEPAPER SCOPE"
        title="More than a marketing document."
        text="The official Rabbit Whitepaper will describe the protocol that actually ships, with technical details tied to the implementation and validated network parameters."
      />

      <div className="resource-grid">
        <article>
          <BookOpen/>
          <h3>LCQ Consensus</h3>
          <p>
            Eligibility, queue formation, producer selection,
            committee participation and recovery behavior.
          </p>
        </article>

        <article>
          <FileText/>
          <h3>Network Architecture</h3>
          <p>
            EVM execution, P2P networking, nodes, mining,
            JSON-RPC and block lifecycle.
          </p>
        </article>

        <article>
          <ShieldCheck/>
          <h3>Economics & Security</h3>
          <p>
            Reward distribution, protocol incentives,
            security assumptions and launch model.
          </p>
        </article>
      </div>
    </section>

    <section className="page-section shell">
      <SectionHeader
        eyebrow="PUBLICATION"
        title="The Whitepaper will be published when it is ready."
        text="Until then, the site keeps this official location reserved without publishing incomplete or unverified protocol claims."
      />

      <div className="reference-grid">
        <div>
          <span>Online version</span>
          <b>Coming later</b>
        </div>

        <div>
          <span>PDF release</span>
          <b>Coming later</b>
        </div>

        <div>
          <span>GitHub source</span>
          <b>Coming later</b>
        </div>

        <div>
          <span>Versioning</span>
          <b>Planned</b>
        </div>
      </div>
    </section>
  </main>
}
