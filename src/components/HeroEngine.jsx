import NetworkCanvas from './NetworkCanvas'

export default function HeroEngine() {
  return (
    <div className="hero-engine">
      <NetworkCanvas />
      <div className="engine-ring ring-a" />
      <div className="engine-ring ring-b" />
      <div className="engine-ring ring-c" />
      <div className="engine-core">
        <div className="engine-core-halo" />
        <img src="/rabbit-mark.png" alt="Rabbit Chain" />
        <span>LCQ CORE</span>
      </div>
      <div className="engine-node node-1"><b>01</b><span>WORK</span></div>
      <div className="engine-node node-2"><b>02</b><span>ELIGIBLE</span></div>
      <div className="engine-node node-3 active"><b>03</b><span>PRODUCER</span></div>
      <div className="engine-node node-4"><b>04</b><span>COMMITTEE</span></div>
      <div className="engine-block"><span>NEXT BLOCK</span><b>LCQ</b><i /></div>
      <div className="engine-readout readout-a"><span>CONSENSUS</span><strong>LCQ</strong></div>
      <div className="engine-readout readout-b"><span>EXECUTION</span><strong>EVM</strong></div>
      <div className="engine-readout readout-c"><span>NETWORK</span><strong>P2P</strong></div>
    </div>
  )
}
