import { useState } from 'react'

const stages = [
  { key:'RUN', title:'Join the network', text:'Run Rabbit and connect through P2P. Participation starts at the node, not an application form.' },
  { key:'PROVE', title:'Generate valid work', text:'Proof-of-work establishes participation under the consensus rules.' },
  { key:'QUALIFY', title:'Become eligible', text:'Eligibility is derived from protocol state and activity — not a privileged operator list.' },
  { key:'QUEUE', title:'Enter LCQ ordering', text:'Eligible wallets are coordinated through Live Consensus Queue for producer opportunity.' },
  { key:'PRODUCE', title:'Create the next block', text:'The selected producer creates the block and committee participation completes the consensus flow.' }
]

export default function LCQVisualizer() {
  const [active, setActive] = useState(3)
  const stage = stages[active]
  return <div className="lcq-visualizer">
    <div className="lcq-tabs">{stages.map((s,i)=><button key={s.key} className={active===i?'active':''} onClick={()=>setActive(i)}><span>0{i+1}</span>{s.key}</button>)}</div>
    <div className="lcq-stage">
      <div className="lcq-stage-copy"><span className="eyebrow">STEP 0{active+1}</span><h3>{stage.title}</h3><p>{stage.text}</p><div className="lcq-stage-meta"><div><small>INPUT</small><b>{active < 2 ? 'Node / Work' : 'Eligible state'}</b></div><div><small>OUTPUT</small><b>{active === 4 ? 'Block' : stages[Math.min(active+1,4)].key}</b></div></div></div>
      <div className={`lcq-map stage-${active}`}>
        <div className="lcq-grid"/>
        <div className="lcq-core"><img src="/rabbit-mark.png" alt=""/><span>LCQ</span></div>
        {[0,1,2,3,4,5,6].map((n)=><div className={`lcq-peer peer-${n} ${n===active?'hot':''}`} key={n}><span>{String(n+1).padStart(2,'0')}</span></div>)}
        <div className="lcq-path path-a"/><div className="lcq-path path-b"/>
        <div className="producer-chip"><i/>PRODUCER</div>
        <div className="committee-chip">COMMITTEE · 30%</div>
      </div>
    </div>
  </div>
}
