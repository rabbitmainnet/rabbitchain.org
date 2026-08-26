import { Check } from 'lucide-react'

const stages = [
  { id: '01', label: 'WORK', title: 'Valid work', note: 'Accepted by protocol rules' },
  { id: '02', label: 'ELIGIBILITY', title: 'Eligible set', note: 'Open producer opportunity' },
  { id: '03', label: 'LCQ', title: 'Resolve next', note: 'Deterministic queue position', active: true },
  { id: '04', label: 'PRODUCER', title: 'Produce block', note: 'Selected producer builds' },
  { id: '05', label: 'COMMITTEE', title: 'Complete', note: 'Consensus path completes' },
]

export default function ProtocolConsole({ compact = false }) {
  return (
    <div className={`protocol-map protocol-map-v5 ${compact ? 'compact' : ''}`}>
      <div className="protocol-map-head">
        <div><span className="status-pulse" /><b>LCQ CONSENSUS FLOW</b></div>
        <span>ILLUSTRATIVE · PRE-LAUNCH</span>
      </div>

      <div className="protocol-v5-body">
        <div className="protocol-v5-intro">
          <span>PRODUCER COORDINATION</span>
          <strong>One protocol path to the next block.</strong>
          <p>Valid participation opens eligibility. LCQ resolves the next producer opportunity, then committee participation completes the block path.</p>
        </div>

        <div className="protocol-v5-rail" aria-label="Illustrative LCQ consensus path">
          {stages.map((stage, index) => (
            <section className={stage.active ? 'active' : ''} key={stage.id}>
              <div className="protocol-v5-stage-top">
                <span className="protocol-v5-stage-number">{stage.id}</span>
                <b>{stage.label}</b>
              </div>

              <h3>{stage.title}</h3>
              <p>{stage.note}</p>

              {stage.id === '01' && (
                <div className="protocol-v5-state verified"><Check size={13} /><span>VERIFIED</span></div>
              )}

              {stage.id === '02' && (
                <div className="protocol-v5-wallets" aria-label="Illustrative eligible wallets">
                  <span>01</span><span>02</span><span className="selected">03</span><span>04</span><span>05</span>
                </div>
              )}

              {stage.id === '03' && (
                <div className="protocol-v5-queue">
                  <small>QUEUE</small>
                  <div><strong>03</strong><span>NEXT</span></div>
                </div>
              )}

              {stage.id === '04' && (
                <div className="protocol-v5-state"><span>SELECTED ROLE</span><b>PRODUCER</b></div>
              )}

              {stage.id === '05' && (
                <div className="protocol-v5-state complete"><Check size={13} /><span>COMPLETE</span></div>
              )}

              {index < stages.length - 1 && <i className="protocol-v5-arrow" aria-hidden="true">→</i>}
            </section>
          ))}
        </div>

        <div className="protocol-v5-bottom">
          <div className="protocol-v5-path">
            <span>BLOCK PATH</span>
            <strong>Work → Eligibility → LCQ → Producer → Committee</strong>
          </div>

          <div className="protocol-v5-economics">
            <span className="producer"><b>70%</b><small>PRODUCER</small></span>
            <span className="committee"><b>30%</b><small>COMMITTEE</small></span>
          </div>
        </div>
      </div>

      <div className="protocol-map-foot protocol-v5-foot">
        <div><span>CONSENSUS</span><strong>LCQ</strong></div>
        <div><span>EXECUTION</span><strong>EVM</strong></div>
        <div><span>NETWORK</span><strong>P2P</strong></div>
        <div><span>TESTNET</span><strong>9280</strong></div>
      </div>
    </div>
  )
}
