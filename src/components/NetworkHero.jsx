import { motion } from 'framer-motion'
import { ArrowRight, Check, CircleDot, Cpu, Network, ShieldCheck } from 'lucide-react'

const rows = [
  ['01','0x12A…B901','VERIFIED','ELIGIBLE'],
  ['02','0x91F…27C8','VERIFIED','ELIGIBLE'],
  ['03','0x6D4…A112','VERIFIED','NEXT'],
  ['04','0xA87…C4E2','VERIFIED','ELIGIBLE'],
  ['05','0x44C…09F1','VERIFIED','ELIGIBLE'],
]

export default function NetworkHero(){
  return <div className="rc7-protocol-console" translate="no" aria-label="Illustrative LCQ protocol coordination model">
    <div className="rc7-console-topbar">
      <div className="rc7-console-brand"><span className="rc7-console-dot"/><b>LCQ COORDINATION</b><small>PROTOCOL MODEL</small></div>
      <div className="rc7-console-network"><span>RABBIT TESTNET</span><b>9280</b></div>
    </div>

    <div className="rc7-console-summary">
      <div><span>CONSENSUS STATE</span><strong>ELIGIBILITY ACTIVE</strong></div>
      <div><span>NEXT OPPORTUNITY</span><strong className="accent">POSITION 03</strong></div>
    </div>

    <div className="rc7-console-table">
      <div className="rc7-console-table-head"><span>QUEUE</span><span>PARTICIPANT</span><span>WORK</span><span>STATE</span></div>
      {rows.map(([pos,address,work,state],index)=><motion.div
        className={`rc7-console-row ${state==='NEXT'?'selected':''}`}
        key={pos}
        initial={{opacity:0,x:10}}
        animate={{opacity:1,x:0}}
        transition={{delay:.08*index,duration:.34}}
      >
        <span className="rc7-queue-position">{pos}</span>
        <code>{address}</code>
        <span className="rc7-work-state"><Check size={12}/> {work}</span>
        <b>{state}{state==='NEXT'&&<ArrowRight size={13}/>}</b>
      </motion.div>)}
    </div>

    <div className="rc7-console-flow">
      <div><span><CircleDot size={13}/> 01</span><b>VALID WORK</b></div>
      <i/>
      <div><span><ShieldCheck size={13}/> 02</span><b>ELIGIBILITY</b></div>
      <i/>
      <div className="active"><span><Network size={13}/> 03</span><b>QUEUE</b></div>
      <i/>
      <div><span><Cpu size={13}/> 04</span><b>PRODUCER</b></div>
    </div>

    <div className="rc7-console-footer">
      <span>ILLUSTRATIVE FLOW — NOT LIVE TELEMETRY</span>
      <div><b>EVM</b><b>P2P</b><b>~10s TARGET</b><b>70 / 30</b></div>
    </div>
  </div>
}
