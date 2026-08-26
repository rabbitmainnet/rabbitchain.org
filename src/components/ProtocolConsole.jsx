import { Check, ChevronRight } from 'lucide-react'

const rows = [
  ['01', 'Eligible wallet', 'VERIFIED', 'WAITING'],
  ['02', 'Eligible wallet', 'VERIFIED', 'WAITING'],
  ['03', 'Eligible wallet', 'VERIFIED', 'NEXT'],
  ['04', 'Eligible wallet', 'VERIFIED', 'WAITING'],
  ['05', 'Eligible wallet', 'VERIFIED', 'WAITING'],
]

export default function ProtocolConsole({ compact = false }) {
  return (
    <div className={`protocol-console ${compact ? 'compact' : ''}`}>
      <div className="protocol-console-head">
        <div>
          <span className="status-pulse" />
          <b>LCQ PROTOCOL MODEL</b>
        </div>
        <small>ILLUSTRATIVE · PRE-LAUNCH</small>
      </div>

      <div className="protocol-console-body">
        <div className="protocol-console-title">
          <div>
            <span>LIVE CONSENSUS QUEUE</span>
            <strong>Eligibility → queue → producer</strong>
          </div>
          <em>TESTNET 9280</em>
        </div>

        <div className="protocol-selected">
          <div>
            <span>NEXT PRODUCER OPPORTUNITY</span>
            <strong>Resolved by protocol state</strong>
          </div>
          <b>03</b>
        </div>

        <div className="protocol-queue" role="table" aria-label="Illustrative LCQ queue">
          {rows.map(([position, wallet, state, role]) => (
            <div className={`protocol-queue-row ${role === 'NEXT' ? 'active' : ''}`} role="row" key={position}>
              <span className="queue-position">{position}</span>
              <span className="queue-wallet">{wallet}</span>
              <span className="queue-state"><Check size={13} /> {state}</span>
              <span className="queue-role">{role}{role === 'NEXT' && <ChevronRight size={13} />}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="protocol-console-foot">
        <div><span>CONSENSUS</span><strong>LCQ</strong></div>
        <div><span>EXECUTION</span><strong>EVM</strong></div>
        <div><span>NETWORK</span><strong>P2P</strong></div>
        <div><span>REWARD</span><strong>70 / 30</strong></div>
      </div>
    </div>
  )
}
