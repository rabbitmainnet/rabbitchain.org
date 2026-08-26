import { Check } from 'lucide-react'

const participants = ['01', '02', '03', '04', '05']

export default function ProtocolConsole({ compact = false }) {
  return (
    <div className={`protocol-map protocol-map-v3 ${compact ? 'compact' : ''}`}>
      <div className="protocol-map-head">
        <div><span className="status-pulse" /><b>LCQ CONSENSUS FLOW</b></div>
        <span>ILLUSTRATIVE · PRE-LAUNCH</span>
      </div>

      <div className="protocol-v3-body">
        <div className="protocol-v3-intro">
          <span>PRODUCER COORDINATION</span>
          <strong>One protocol path from valid participation to the next block.</strong>
          <p>Valid work opens eligibility. LCQ resolves the next producer opportunity, and committee participation completes the block path.</p>
        </div>

        <div className="protocol-v3-flow" aria-label="Illustrative LCQ producer flow">
          <section>
            <div className="protocol-v3-step-head"><span>01</span><i /><b>WORK</b></div>
            <h3>Valid work</h3>
            <p>Participation begins with work accepted under the active Rabbit rules.</p>
            <div className="protocol-v3-state"><Check size={14} /><span>WORK VERIFIED</span></div>
          </section>

          <section>
            <div className="protocol-v3-step-head"><span>02</span><i /><b>ELIGIBILITY</b></div>
            <h3>Eligible set</h3>
            <p>Protocol state determines which wallets can enter producer coordination.</p>
            <div className="protocol-v3-participants" aria-label="Illustrative eligible wallets">
              {participants.map((id) => <span className={id === '03' ? 'active' : ''} key={id}>{id}</span>)}
            </div>
          </section>

          <section className="focus">
            <div className="protocol-v3-step-head"><span>03</span><i /><b>LCQ</b></div>
            <h3>Resolve next</h3>
            <p>The live consensus queue deterministically resolves the next opportunity.</p>
            <div className="protocol-v3-position">
              <small>QUEUE POSITION</small>
              <div><b>03</b><span>NEXT</span></div>
            </div>
          </section>

          <section>
            <div className="protocol-v3-step-head"><span>04</span><i /><b>PRODUCER</b></div>
            <h3>Produce block</h3>
            <p>The selected producer builds the next block under the protocol rules.</p>
            <div className="protocol-v3-endstate"><span>SELECTED ROLE</span><b>PRODUCER</b></div>
          </section>

          <section>
            <div className="protocol-v3-step-head"><span>05</span><i /><b>COMMITTEE</b></div>
            <h3>Complete consensus</h3>
            <p>Committee participation completes the consensus path for the block.</p>
            <div className="protocol-v3-endstate complete"><Check size={14} /><b>COMPLETE</b></div>
          </section>
        </div>

        <div className="protocol-v3-economics">
          <div className="protocol-v3-economics-copy">
            <span>BLOCK ECONOMICS</span>
            <strong>Two protocol roles. One deterministic reward split.</strong>
          </div>
          <div className="protocol-v3-meter" aria-label="70 percent producer and 30 percent committee reward split">
            <span className="producer"><b>70%</b><small>PRODUCER</small></span>
            <span className="committee"><b>30%</b><small>COMMITTEE</small></span>
          </div>
        </div>
      </div>

      <div className="protocol-map-foot protocol-v3-foot">
        <div><span>CONSENSUS</span><strong>LCQ</strong></div>
        <div><span>EXECUTION</span><strong>EVM</strong></div>
        <div><span>NETWORK</span><strong>P2P</strong></div>
        <div><span>TESTNET</span><strong>9280</strong></div>
      </div>
    </div>
  )
}
