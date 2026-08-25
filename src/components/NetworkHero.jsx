import { motion } from 'framer-motion'

const nodes = [
  { id: '01', x: '8%', y: '58%' },
  { id: '02', x: '25%', y: '39%' },
  { id: '03', x: '45%', y: '62%', hot: true },
  { id: '04', x: '66%', y: '35%' },
  { id: '05', x: '84%', y: '55%' }
]

export default function NetworkHero() {
  return <div className="network-hero-card">
    <div className="network-hero-top"><span><i/>PUBLIC TESTNET PATH</span><b>CHAIN 9280</b></div>
    <div className="network-hero-canvas">
      <div className="hero-gradient-orb"/>
      <div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/>
      <motion.div className="hero-core" animate={{ y: [0,-5,0] }} transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}>
        <img src="/rabbit-mark.png" alt=""/><span>LCQ</span><small>CONSENSUS</small>
      </motion.div>
      <div className="queue-line"/>
      {nodes.map((node, idx) => <motion.div key={node.id} className={`queue-node ${node.hot ? 'hot' : ''}`} style={{ left: node.x, top: node.y }} initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.15 + idx*.08 }}><span>{node.id}</span><small>{node.hot ? 'NEXT' : 'ELIGIBLE'}</small></motion.div>)}
      <div className="producer-ticket"><span>PRODUCER OPPORTUNITY</span><strong>03</strong><small>determined by protocol</small></div>
    </div>
    <div className="network-hero-foot">
      <div><span>CONSENSUS</span><b>LCQ</b></div>
      <div><span>EXECUTION</span><b>EVM</b></div>
      <div><span>NETWORK</span><b>P2P</b></div>
      <div><span>STATUS</span><b>PRE-LAUNCH</b></div>
    </div>
  </div>
}
