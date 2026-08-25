import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import HeroEngine from '../components/HeroEngine'
import SectionIntro from '../components/SectionIntro'
import LCQVisualizer from '../components/LCQVisualizer'
import NetworkPanel from '../components/NetworkPanel'

export default function Home({ walletState, onConnect, onSwitch, toast }) {
  return <>
    <section className="hero home-hero">
      <div className="hero-gradient hero-gradient-a"/><div className="hero-gradient hero-gradient-b"/>
      <div className="hero-copy">
        <div className="hero-kicker"><i/>RABBIT CHAIN · LAYER 1 · LCQ</div>
        <h1>One wallet.<br/><em>One fair chance.</em></h1>
        <p>Rabbit Chain is a permissionless EVM Layer 1 built around <b>Live Consensus Queue</b> — rethinking how mining participation becomes block-production opportunity.</p>
        <div className="hero-actions"><Link className="primary-cta" to="/lcq">DISCOVER LCQ <ArrowUpRight size={16}/></Link><Link className="secondary-cta" to="/network">EXPLORE NETWORK <ChevronRight size={16}/></Link><button className="tertiary-cta" onClick={onConnect}>{walletState.account?'OPEN WALLET':'CONNECT WALLET'} <span>+</span></button></div>
        <div className="hero-specs"><div><span>CONSENSUS</span><b>LCQ</b></div><div><span>TESTNET</span><b>9280</b></div><div><span>MAINNET</span><b>928</b></div><div><span>EXECUTION</span><b>EVM</b></div></div>
      </div>
      <div className="hero-engine-wrap"><HeroEngine/></div>
      <div className="hero-bottom-strip"><span>PROOF OF WORK</span><i/> <span>ELIGIBILITY</span><i/> <span>LIVE QUEUE</span><i/> <span>PRODUCER</span><i/> <span>COMMITTEE</span></div>
    </section>

    <section className="positioning-section"><span className="section-number">00</span><div><small>THE PRINCIPLE</small><h2>Mining should prove participation.<br/>It should not create <em>permanent dominance.</em></h2></div><p>Rabbit is designed around open participation and deterministic coordination. LCQ turns eligible work into an ordered producer opportunity without a manually curated producer list.</p></section>

    <section className="feature-marquee"><div>PERMISSIONLESS <i/> EVM <i/> LCQ CONSENSUS <i/> P2P <i/> FAIR OPPORTUNITY <i/> PRODUCER + COMMITTEE</div></section>

    <section className="home-lcq section-pad" id="lcq-preview"><SectionIntro index="01" label="LCQ CONSENSUS" title={<>A consensus system you can <em>see.</em></>} text="Follow the path from running a Rabbit node to the next producer opportunity. The visualization is educational and does not claim that the public network is already live."/><LCQVisualizer/><div className="section-link-row"><Link to="/lcq">OPEN THE LCQ ARCHITECTURE <ArrowUpRight size={15}/></Link></div></section>

    <section className="reward-section"><div className="reward-copy"><span>02 / BLOCK ECONOMICS</span><h2>One block.<br/><em>Shared consensus roles.</em></h2><p>The reward model separates the producer role from committee participation.</p></div><div className="reward-viz"><div className="reward-70"><strong>70</strong><span>%</span><small>PRODUCER</small></div><div className="reward-30"><strong>30</strong><span>%</span><small>COMMITTEE</small></div><div className="reward-track"><i/></div></div></section>

    <section className="home-network section-pad"><SectionIntro index="03" label="NETWORK HUB" title={<>Testnet first.<br/><em>Mainnet prepared.</em></>} text="The official portal is built for both networks from day one. Endpoints can be activated without redesigning the user experience."/><NetworkPanel onConnect={onConnect} onSwitch={onSwitch} walletState={walletState} toast={toast}/><div className="section-link-row"><Link to="/network">OPEN NETWORK HUB <ArrowUpRight size={15}/></Link></div></section>

    <section className="run-section"><div className="run-watermark">RUN RABBIT</div><div className="run-copy"><span>04 / PARTICIPATE</span><h2>Download.<br/>Run.<br/><em>Participate.</em></h2><p>No application form. No privileged miner list. Rabbit participation starts by running the client and following the network rules.</p><Link className="primary-cta" to="/mining">START MINING <ArrowUpRight size={15}/></Link></div><div className="run-terminal"><div className="terminal-head"><span><i/><i/><i/></span><b>rabbit / testnet</b><em>9280</em></div><pre><code><span>$</span> rabbit --network rabbit-testnet{`\n`}<i>✓</i> p2p discovery enabled{`\n`}<i>✓</i> lcq consensus engine loaded{`\n`}<i>✓</i> producer identity ready{`\n`}<i>✓</i> participation state synchronized{`\n\n`}<b>waiting for producer opportunity_</b></code></pre></div></section>

    <section className="developer-teaser section-pad"><div className="developer-teaser-copy"><span>05 / DEVELOPERS</span><h2>EVM outside.<br/><em>LCQ underneath.</em></h2><p>Build with familiar Ethereum execution tooling while Rabbit coordinates block production through its own consensus architecture.</p><Link to="/developers">BUILD ON RABBIT <ArrowUpRight size={15}/></Link></div><div className="code-window"><div className="code-tabs"><span className="active">network.js</span><span>deploy.sol</span><span>rpc</span></div><pre><code><span>const</span> rabbitTestnet = {'{'}{`\n`}  chainId: <b>9280</b>,{`\n`}  currency: <em>'RAB'</em>,{`\n`}  consensus: <em>'LCQ'</em>,{`\n`}  execution: <em>'EVM'</em>{`\n`}{'}'}</code></pre></div></section>

    <section className="portal-section section-pad"><SectionIntro index="06" label="RABBIT PORTAL" title={<>Everything needed to<br/><em>enter the network.</em></>}/><div className="portal-grid">{[['LCQ','Understand consensus','/lcq'],['NETWORK','Testnet + Mainnet','/network'],['MINING','Run Rabbit','/mining'],['DEVELOPERS','Build on Rabbit','/developers'],['DOCS','Technical guide','/docs'],['GITHUB','Open source','https://github.com/rabbitmainnet']].map(([name,desc,href],i)=>href.startsWith('http')?<a key={name} className="portal-card" href={href} target="_blank" rel="noreferrer"><span>0{i+1}</span><div><b>{name}</b><p>{desc}</p></div><i>↗</i></a>:<Link key={name} className="portal-card" to={href}><span>0{i+1}</span><div><b>{name}</b><p>{desc}</p></div><i>↗</i></Link>)}</div></section>

    <section className="final-cta"><img src="/rabbit-mark.png" alt=""/><span>RABBIT CHAIN</span><h2>The network begins with<br/><em>one fair chance.</em></h2><div><Link className="primary-cta" to="/network">EXPLORE TESTNET <ArrowUpRight size={15}/></Link><a className="secondary-cta" href="https://github.com/rabbitmainnet" target="_blank" rel="noreferrer">VIEW GITHUB <ArrowUpRight size={15}/></a></div></section>
  </>
}
