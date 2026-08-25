import { motion } from 'framer-motion'

const nodes = [
  { id: '01', x: '7%', y: '61%', state: 'ELIGIBLE' },
  { id: '02', x: '25%', y: '39%', state: 'ELIGIBLE' },
  { id: '03', x: '46%', y: '64%', state: 'NEXT', hot: true },
  { id: '04', x: '67%', y: '36%', state: 'ELIGIBLE' },
  { id: '05', x: '86%', y: '58%', state: 'ELIGIBLE' }
]

export default function NetworkHero() {
  return <div className="network-hero-card" translate="no">
    <div className="network-hero-top">
      <span><i/>RABBIT TESTNET · LCQ PRODUCER FLOW</span>
      <b>CHAIN ID 9280</b>
    </div>

    <div className="network-hero-canvas">
      <div className="hero-map-caption">
        <span>LIVE CONSENSUS QUEUE</span>
        <b>Deterministic producer coordination</b>
      </div>

      <div className="hero-gradient-orb"/>
      <div className="hero-orbit orbit-a"/>
      <div className="hero-orbit orbit-b"/>
      <div className="hero-orbit orbit-c"/>

      <motion.div
        className="hero-core"
        animate={{ y: [0,-5,0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="hero-core-ring"/>
        <img src="/rabbit-mark.png" alt=""/>
        <strong>LCQ</strong>
        <small>CONSENSUS CORE</small>
      </motion.div>

      <div className="queue-line"/>
      <div className="queue-line-glow"/>

      {nodes.map((node, idx) =>
        <motion.div
          key={node.id}
          className={`queue-node ${node.hot ? 'hot' : ''}`}
          style={{ left: node.x, top: node.y }}
          initial={{ opacity:0, scale:.8 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ delay:.15 + idx*.08 }}
        >
          <span>{node.id}</span>
          <small>{node.state}</small>
        </motion.div>
      )}

      <div className="producer-ticket">
        <span>SELECTED OPPORTUNITY</span>
        <div><strong>03</strong><i>→</i><b>BLOCK</b></div>
        <small>determined by protocol rules</small>
      </div>

      <div className="hero-signal-row">
        <span><i/>WORK VERIFIED</span>
        <span><i/>ELIGIBILITY ACTIVE</span>
        <span><i/>QUEUE POSITION 03</span>
      </div>
    </div>

    <div className="network-hero-foot">
      <div><span>CONSENSUS</span><b>LCQ</b></div>
      <div><span>EXECUTION</span><b>EVM</b></div>
      <div><span>NETWORK</span><b>P2P</b></div>
      <div><span>STATUS</span><b>PRE-LAUNCH</b></div>
    </div>
  </div>
}
