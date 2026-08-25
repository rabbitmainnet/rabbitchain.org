import { useEffect, useState } from 'react'
import { Copy, ExternalLink, Wallet, CheckCircle2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { NETWORKS } from '../config/networks'

export default function NetworkPanel({ onConnect, onSwitch, walletState, toast }) {
  const location=useLocation()
  const params=new URLSearchParams(location.search)
  const requested=params.get('network')
  const [selected, setSelected] = useState(requested==='testnet'?'testnet':'mainnet')
  useEffect(()=>{ if(requested==='testnet'||requested==='mainnet') setSelected(requested) },[requested])
  const network = NETWORKS[selected]
  const copy = async (value, label) => { await navigator.clipboard.writeText(value); toast(`${label} copied`) }
  return <div className="network-panel-v7">
    <div className="network-selector">
      <button className={selected==='mainnet'?'active':''} onClick={()=>setSelected('mainnet')}><span>01</span><div><b>Rabbit Mainnet</b><small>Flagship production network</small></div><em>COMING SOON</em></button>
      <button className={selected==='testnet'?'active':''} onClick={()=>setSelected('testnet')}><span>02</span><div><b>Rabbit Testnet</b><small>Public launch environment</small></div><em>PRE-LAUNCH</em></button>
    </div>
    <div className={`network-detail network-detail-${selected}`}>
      <div className="network-detail-head">
        <div><span>{selected==='mainnet'?'FLAGSHIP NETWORK':'PUBLIC TESTNET'}</span><h3>{network.name}</h3><p>{selected==='mainnet'?'The production Rabbit Chain network. Mainnet remains the primary network across the portal, with launch following public testnet validation.':'The public environment for validating nodes, mining, wallets, RPC, explorer and developer workflows before mainnet.'}</p></div>
        <div className="network-big-id"><small>CHAIN ID</small><strong>{network.chainId}</strong></div>
      </div>
      <div className="network-facts">
        <div><span>Consensus</span><b>{network.consensus}</b></div>
        <div><span>Execution</span><b>{network.execution}</b></div>
        <div><span>Native asset</span><b>{network.currency}</b></div>
        <div><span>Architecture</span><b>P2P</b></div>
      </div>
      <div className="endpoint-grid">
        <div><span>RPC</span><b>{network.rpcUrl.replace('https://','')}</b><em>{network.publicRpcReady?'LIVE':'RESERVED'}</em><button onClick={()=>copy(network.rpcUrl,'RPC')}><Copy size={14}/></button></div>
        <div><span>Explorer</span><b>{network.explorerUrl.replace('https://','')}</b><em>{network.publicRpcReady?'LIVE':'RESERVED'}</em><button onClick={()=>copy(network.explorerUrl,'Explorer')}><Copy size={14}/></button></div>
        {network.faucetUrl&&<div><span>Faucet</span><b>{network.faucetUrl.replace('https://','')}</b><em>{network.publicRpcReady?'LIVE':'RESERVED'}</em><button onClick={()=>copy(network.faucetUrl,'Faucet')}><Copy size={14}/></button></div>}
      </div>
      <div className="network-tools">
        <div><CheckCircle2 size={17}/><span>{selected==='mainnet'?'Mainnet configuration is already modeled in the portal.':'Testnet tools will unlock as the public endpoints go live.'}</span></div>
        <button className="network-primary" onClick={()=>walletState.account?onSwitch(network):onConnect()}><Wallet size={15}/>{walletState.account?(network.publicRpcReady?'ADD / SWITCH NETWORK':'PUBLIC RPC PENDING'):'CONNECT WALLET'}</button>
        <button disabled={!network.publicRpcReady}><ExternalLink size={15}/>OPEN EXPLORER</button>
      </div>
    </div>
  </div>
}
