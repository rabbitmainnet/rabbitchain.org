import { useState } from 'react'

const stages = [
  { key:'RUN', num:'01', title:'Run Rabbit', text:'A participant starts by running the Rabbit client and joining peer-to-peer discovery.', input:'Rabbit client', output:'P2P participant' },
  { key:'PROVE', num:'02', title:'Generate valid work', text:'Proof-of-work establishes protocol participation under the active network rules.', input:'Participant', output:'Valid work' },
  { key:'QUALIFY', num:'03', title:'Become eligible', text:'Eligibility is derived from protocol state and activity instead of manual producer approval.', input:'Valid work', output:'Eligible wallet' },
  { key:'QUEUE', num:'04', title:'Enter LCQ ordering', text:'LCQ deterministically coordinates eligible wallets into producer opportunity.', input:'Eligible wallet', output:'Queue position' },
  { key:'PRODUCE', num:'05', title:'Produce the block', text:'The selected producer creates the next block while committee participation completes the consensus role split.', input:'Queue position', output:'New block' },
]

export default function LCQVisualizer() {
  const [active,setActive]=useState(0)
  const stage=stages[active]
  return <div className="lcq-visualizer">
    <div className="lcq-tabs">
      {stages.map((s,i)=><button key={s.key} className={active===i?'active':''} onClick={()=>setActive(i)}><span>{s.num}</span><b>{s.key}</b></button>)}
    </div>
    <div className="lcq-stage">
      <div className="lcq-stage-copy">
        <span className="eyebrow">STEP {stage.num}</span>
        <h3>{stage.title}</h3>
        <p>{stage.text}</p>
        <div className="lcq-stage-meta"><div><small>INPUT</small><b>{stage.input}</b></div><div><small>OUTPUT</small><b>{stage.output}</b></div></div>
      </div>
      <div className={`lcq-map stage-${active}`}>
        <div className="lcq-grid"/>
        <div className="lcq-rail"><i/></div>
        {[0,1,2,3,4].map((n)=><div className={`lcq-peer peer-${n} ${n===active?'hot':''}`} key={n}><span>0{n+1}</span><small>{stages[n].key}</small></div>)}
        <div className="lcq-core"><img src="/rabbit-mark.png" alt=""/><span>LCQ</span></div>
        <div className="producer-chip"><i/>SELECTED PRODUCER</div>
        <div className="committee-chip">COMMITTEE · 30%</div>
      </div>
    </div>
  </div>
}
