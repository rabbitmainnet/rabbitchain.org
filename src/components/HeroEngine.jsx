import { motion } from 'framer-motion'

const seats = [
  {id:'01',x:10,y:63},{id:'02',x:26,y:34},{id:'03',x:46,y:68,active:true},
  {id:'04',x:66,y:28},{id:'05',x:83,y:56}
]

export default function HeroEngine(){
  return <div className="hero-network" aria-label="Illustration of Rabbit LCQ producer coordination">
    <div className="hero-network-head"><span>LIVE CONSENSUS QUEUE</span><b>RABBIT / MAINNET 928</b></div>
    <div className="hero-watermark">R</div>
    <svg className="network-lines" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="rabbitLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ef2aa8"/><stop offset=".48" stopColor="#9b2cff"/><stop offset="1" stopColor="#3157ff"/></linearGradient></defs>
      <path d="M80 395 C220 140 390 520 520 310 C650 98 790 430 930 235" fill="none" stroke="url(#rabbitLine)" strokeWidth="3" opacity=".85"/>
      <path d="M60 450 C260 250 350 460 520 335 C680 220 780 330 945 200" fill="none" stroke="#b8b8c9" strokeWidth="1" opacity=".32" strokeDasharray="6 10"/>
    </svg>
    {seats.map((seat,i)=><motion.div key={seat.id} className={`hero-seat${seat.active?' active':''}`} style={{left:`${seat.x}%`,top:`${seat.y}%`}} initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay:.12*i,duration:.45}}>
      <span>{seat.id}</span><small>{seat.active?'SELECTED':'ELIGIBLE'}</small>
    </motion.div>)}
    <div className="hero-core">
      <div className="hero-core-logo"><img src="/rabbit-mark.png" alt=""/></div>
      <div><span>PRODUCER COORDINATION</span><b>LCQ</b><small>Live Consensus Queue</small></div>
    </div>
    <div className="hero-next-block"><span>NEXT PRODUCER</span><strong>03</strong><small>via LCQ</small></div>
    <div className="hero-network-foot"><span><i className="pink"/>PoW work</span><span><i className="violet"/>Eligibility</span><span><i className="blue"/>Producer queue</span></div>
  </div>
}
