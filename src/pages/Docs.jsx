import { useMemo, useState } from 'react'
import { BookOpen, ChevronRight, Code2, Cpu, FileCheck2, FileCode2, Network, Search, ShieldCheck, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NETWORKS } from '../config/networks'

const t=NETWORKS.testnet
const m=NETWORKS.mainnet

const sections=[
  {id:'overview',title:'Overview',icon:BookOpen,lead:'Rabbit Chain is a permissionless EVM Layer 1 powered by LCQ Consensus.',blocks:[
    {title:'What Rabbit is',text:'Rabbit keeps EVM execution familiar while LCQ coordinates eligible producer opportunities beneath the execution layer. The network is designed around open P2P participation rather than a permanent private operator set.'},
    {title:'Launch order',text:'Rabbit Testnet, Chain ID 9280, is the first public network. Rabbit Mainnet, Chain ID 928, follows public validation and final production release gates.'},
    {title:'Core principle',text:'One wallet. One fair chance. Valid participation feeds protocol-defined eligibility and deterministic coordination.'}
  ]},
  {id:'quickstart',title:'Quick Start',icon:Wallet,lead:'The shortest path for a user or builder to enter Rabbit Testnet.',blocks:[
    {title:'1. Connect a wallet',text:'Use an EIP-6963 compatible browser wallet or WalletConnect. Connecting alone does not require a signature.'},
    {title:'2. Add Rabbit Testnet',text:'Use the portal network button or add the network manually with the parameters below.'},
    {title:'3. Get test assets',text:'When the public faucet is live, request Testnet RAB and any supported testing assets. Test assets are not Mainnet assets.'},
    {title:'4. Inspect activity',text:'Use the official explorer after activation to inspect blocks, transactions, addresses and contracts.'}
  ]},
  {id:'networks',title:'Networks',icon:Network,lead:'Stable network identities with status-aware public services.',blocks:[
    {title:'Rabbit Testnet',table:[['Chain ID','9280'],['Hex','0x2440'],['Native asset','RAB'],['Consensus','LCQ'],['Execution','EVM'],['RPC',t.rpcUrl],['Explorer',t.explorerUrl]]},
    {title:'Rabbit Mainnet',table:[['Chain ID','928'],['Hex','0x3a0'],['Native asset','RAB'],['Consensus','LCQ'],['Execution','EVM'],['RPC',m.rpcUrl],['Explorer',m.explorerUrl]]},
    {title:'Service status',text:'Reserved URLs are published for stable network identity but are not labeled live until their readiness flag is enabled.'}
  ]},
  {id:'wallets',title:'Wallets',icon:Wallet,lead:'RabbitChain.org supports browser wallets and QR-based remote wallets.',blocks:[
    {title:'Injected wallets',text:'The portal discovers compatible browser wallets with EIP-6963 and falls back to a legacy EIP-1193 provider when needed.'},
    {title:'WalletConnect',text:'QR and remote-wallet sessions use WalletConnect through the official Rabbit Reown project metadata for rabbitchain.org.'},
    {title:'Add / switch network',code:`await ethereum.request({\n  method: 'wallet_addEthereumChain',\n  params: [{\n    chainId: '0x2440',\n    chainName: 'Rabbit Testnet',\n    nativeCurrency: { name: 'RAB', symbol: 'RAB', decimals: 18 },\n    rpcUrls: ['${t.rpcUrl}'],\n    blockExplorerUrls: ['${t.explorerUrl}']\n  }]\n})`},
    {title:'Wallet safety',text:'RabbitChain.org should never request a seed phrase or private key. Treat any site that does as malicious.'}
  ]},
  {id:'rpc',title:'JSON-RPC',icon:Code2,lead:'Rabbit exposes a standard EVM JSON-RPC surface when the public endpoint is active.',blocks:[
    {title:'Check Chain ID',code:`curl -X POST \\\n  -H 'Content-Type: application/json' \\\n  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \\\n  ${t.rpcUrl}`},
    {title:'Expected Testnet result',code:`{"jsonrpc":"2.0","id":1,"result":"0x2440"}`},
    {title:'Production rule',text:'Applications should centralize network configuration instead of scattering RPC URLs and chain IDs across the codebase.'}
  ]},
  {id:'contracts',title:'Smart Contracts',icon:FileCode2,lead:'EVM compatibility lets builders use familiar Solidity and Ethereum tooling.',blocks:[
    {title:'Execution model',text:'Contract execution follows the EVM surface while LCQ handles consensus and block-production coordination underneath.'},
    {title:'Deployment',text:'Use Rabbit Testnet as the default environment for deployment, transaction and integration testing before Mainnet.'},
    {title:'Verification',text:'When the explorer is public, verified contract source and canonical addresses should be linked from official Rabbit pages.'}
  ]},
  {id:'lcq',title:'LCQ Consensus',icon:Cpu,lead:'LCQ coordinates the path from valid participation to block production.',blocks:[
    {title:'Consensus flow',text:'Work → Eligibility → Live Consensus Queue → Producer → Committee.'},
    {title:'Reward model',text:'The protocol reward model assigns 70% to the producer role and 30% to committee participation.'},
    {title:'Recovery',text:'Rabbit is designed with fallback and recovery behavior so participant churn does not permanently strand the network.'},
    {title:'Target cadence',text:'The public design targets an approximately ten-second block cadence, subject to finalized network parameters.'}
  ]},
  {id:'mining',title:'Mining',icon:Cpu,lead:'Mining is a software and consensus workflow, not a browser button.',blocks:[
    {title:'Release path',text:'Download only official Rabbit software, verify the published checksum, initialize a clean network data directory and then join P2P.'},
    {title:'LCQ participation',text:'Valid work contributes to eligibility. LCQ determines producer coordination according to protocol state.'},
    {title:'Downloads',text:'Platform download buttons remain disabled until real Testnet binaries and checksums are published.'}
  ]},
  {id:'nodes',title:'Node Operations',icon:Network,lead:'Independent infrastructure is part of the Rabbit permissionless model.',blocks:[
    {title:'Node roles',text:'Full nodes, mining nodes, RPC nodes and archive/indexer nodes can serve different operational purposes.'},
    {title:'P2P',text:'Independent nodes discover peers, synchronize chain state and propagate blocks and transactions.'},
    {title:'Public RPC',text:'The official RPC is a convenience endpoint, not a requirement for operating your own infrastructure.'}
  ]},
  {id:'releases',title:'Releases',icon:FileCheck2,lead:'Every public binary should be traceable to a version and checksum.',blocks:[
    {title:'Release identity',text:'A public release should state network target, version, operating system, architecture and release notes.'},
    {title:'Checksum',text:'SHA-256 values should be published beside the corresponding artifact and verified locally before execution.'},
    {title:'Clean network rule',text:'A new official network should start from deliberately finalized configuration rather than reusing laboratory chain state.'}
  ]},
  {id:'security',title:'Security',icon:ShieldCheck,lead:'Verify domains, wallet requests, release artifacts and network state.',blocks:[
    {title:'Official domain',text:'The primary public portal is rabbitchain.org. Official links should originate here or from the Rabbit GitHub organization.'},
    {title:'Secrets',text:'Never share private keys or seed phrases with the website, social accounts, support channels or public issue trackers.'},
    {title:'Pre-launch honesty',text:'RPC, explorer, faucet, downloads and Mainnet stay labeled Reserved, Coming Soon or Not Launched until they are actually available.'}
  ]}
]

function Block({block}){
  return <section className="docs-block"><h2>{block.title}</h2>{block.text&&<p>{block.text}</p>}{block.code&&<pre><code>{block.code}</code></pre>}{block.table&&<div className="docs-table">{block.table.map(([k,v])=><div key={k}><span>{k}</span><code>{v}</code></div>)}</div>}</section>
}

export default function Docs(){
  const [active,setActive]=useState('overview')
  const [q,setQ]=useState('')
  const current=sections.find((s)=>s.id===active)||sections[0]
  const filtered=useMemo(()=>sections.filter((s)=>(s.title+' '+s.lead).toLowerCase().includes(q.toLowerCase())),[q])
  return <main className="docs-page"><div className="docs-shell"><aside><div className="docs-brand"><span>RABBIT DOCS</span><h2>Documentation</h2><small>RC5 portal reference</small></div><label className="docs-search"><Search size={15}/><input placeholder="Filter docs" value={q} onChange={(e)=>setQ(e.target.value)}/></label><nav>{filtered.map((s)=>{const Icon=s.icon;return <button key={s.id} className={active===s.id?'active':''} onClick={()=>setActive(s.id)}><span><Icon size={15}/>{s.title}</span><ChevronRight size={13}/></button>})}</nav><div className="docs-aside-links"><Link to="/releases">Official releases →</Link><Link to="/security">Security center →</Link><Link to="/status">Network status →</Link></div></aside><article className="docs-content"><span className="docs-eyebrow">RABBIT CHAIN / {current.title.toUpperCase()}</span><h1>{current.title}</h1><p className="docs-lead">{current.lead}</p>{current.blocks.map((block)=><Block key={block.title} block={block}/>) }<div className="docs-warning"><b>Launch status matters</b><p>Reserved RPC, explorer, faucet, binaries and Mainnet services are not presented as live until the corresponding public release state is intentionally enabled.</p></div></article></div></main>
}
