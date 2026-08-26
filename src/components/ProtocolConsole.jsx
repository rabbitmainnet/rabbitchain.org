import { Check, ChevronRight } from 'lucide-react'

const wallets = [
  ['01', 'eligible'],
  ['02', 'eligible'],
  ['03', 'next'],
  ['04', 'eligible'],
  ['05', 'eligible'],
]

export default function ProtocolConsole({ compact = false }) {
  return (
    <div className={`protocol-map ${compact ? 'compact' : ''}`}>
      <div className="protocol-map-head">
        <div><span className="status-pulse" /><b>LCQ CONSENSUS FLOW</b></div>
        <span>ILLUSTRATIVE · PRE-LAUNCH</span>
      </div>

      <div className="protocol-map-body">
        <div className="protocol-map-intro">
          <span>PRODUCER COORDINATION</span>
          <strong>Valid work opens eligibility. LCQ resolves what comes next.</strong>
        </div>

        <div className="protocol-map-track" aria-label="Illustrative LCQ producer flow">
          <div className="protocol-stage work-stage">
            <small>01</small>
            <span>VALID WORK</span>
            <b>Verified</b>
          </div>

          <div className="protocol-connector"><i /></div>

          <div className="protocol-stage wallet-stage">
            <small>02</small>
            <span>ELIGIBILITY</span>
            <div className="protocol-wallets">
              {wallets.map(([id, state]) => (
                <div className={state === 'next' ? 'active' : ''} key={id}>
                  <b>{id}</b>
                  <small>{state === 'next' ? 'NEXT' : 'READY'}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="protocol-connector emphasis"><i /></div>

          <div className="protocol-stage queue-stage">
            <small>03</small>
            <span>LIVE CONSENSUS QUEUE</span>
            <div className="queue-focus"><b>03</b><em>QUEUE POSITION</em></div>
          </div>

          <div className="protocol-connector emphasis"><i /></div>

          <div className="protocol-stage producer-stage">
            <small>04</small>
            <span>NEXT PRODUCER</span>
            <b>Opportunity #03</b>
          </div>

          <div className="protocol-connector"><i /></div>

          <div className="protocol-stage committee-stage">
            <small>05</small>
            <span>COMMITTEE</span>
            <b><Check size={13} /> Complete</b>
          </div>
        </div>

        <div className="protocol-map-result">
          <div><span>BLOCK PATH</span><strong>Work → Eligibility → LCQ → Producer → Committee</strong></div>
          <ChevronRight size={18} />
          <div className="protocol-reward-mini"><b>70%</b><span>PRODUCER</span><b>30%</b><span>COMMITTEE</span></div>
        </div>
      </div>

      <div className="protocol-map-foot">
        <div><span>CONSENSUS</span><strong>LCQ</strong></div>
        <div><span>EXECUTION</span><strong>EVM</strong></div>
        <div><span>NETWORK</span><strong>P2P</strong></div>
        <div><span>TESTNET</span><strong>9280</strong></div>
      </div>
    </div>
  )
}
