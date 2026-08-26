import { ArrowRight, Check } from 'lucide-react'

const eligible = ['01', '02', '03', '04', '05']

export default function ProtocolConsole({ compact = false }) {
  return (
    <div className={`protocol-map protocol-map-v8 ${compact ? 'compact' : ''}`}>
      <div className="protocol-map-head">
        <div><span className="status-pulse" /><b>LCQ CONSENSUS</b></div>
        <span>ILLUSTRATIVE · PRE-LAUNCH</span>
      </div>

      <div className="protocol-v8-body">
        <div className="protocol-v8-title">
          <span>PRODUCER COORDINATION</span>
          <strong>One opportunity. Resolved by protocol.</strong>
        </div>

        <div className="protocol-v8-visual" aria-label="Illustrative LCQ producer coordination">
          <div className="protocol-v8-side protocol-v8-side-left">
            <span>ELIGIBLE SET</span>
            <strong>Open participation</strong>
            <div className="protocol-v8-wallets">
              {eligible.map((id) => <i className={id === '03' ? 'on' : ''} key={id}>{id}</i>)}
            </div>
          </div>

          <div className="protocol-v8-bridge left" aria-hidden="true">
            <span />
            <ArrowRight size={14} />
          </div>

          <div className="protocol-v8-core">
            <div className="protocol-v8-orbit orbit-one" />
            <div className="protocol-v8-orbit orbit-two" />
            <div className="protocol-v8-glow" />
            <div className="protocol-v8-core-inner">
              <small>LIVE QUEUE</small>
              <b>03</b>
              <span>NEXT</span>
            </div>
            <div className="protocol-v8-core-label">LCQ</div>
          </div>

          <div className="protocol-v8-bridge right" aria-hidden="true">
            <span />
            <ArrowRight size={14} />
          </div>

          <div className="protocol-v8-side protocol-v8-side-right">
            <span>NEXT BLOCK</span>
            <strong>Producer #03</strong>
            <div className="protocol-v8-verified"><Check size={13}/> PROTOCOL RESOLVED</div>
          </div>
        </div>

        <div className="protocol-v8-meta">
          <div>
            <span>PARTICIPATION</span>
            <strong>Permissionless</strong>
          </div>
          <div>
            <span>COORDINATION</span>
            <strong>Deterministic LCQ</strong>
          </div>
          <div>
            <span>REWARD</span>
            <strong>70% / 30%</strong>
          </div>
        </div>
      </div>

      <div className="protocol-map-foot protocol-v8-foot">
        <div><span>CONSENSUS</span><strong>LCQ</strong></div>
        <div><span>EXECUTION</span><strong>EVM</strong></div>
        <div><span>NETWORK</span><strong>P2P</strong></div>
        <div><span>TESTNET</span><strong>9280</strong></div>
      </div>
    </div>
  )
}
