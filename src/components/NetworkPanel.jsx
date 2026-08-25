import { useState } from 'react'
import { Copy, ExternalLink, Wallet } from 'lucide-react'
import { NETWORKS } from '../config/networks'

export default function NetworkPanel({ onConnect, onSwitch, walletState, toast }) {
  const [selected, setSelected] = useState('testnet')
  const network = NETWORKS[selected]
  const copy = async (value, label) => { await navigator.clipboard.writeText(value); toast(`${label} copied`) }
  return <div className="network-panel">
    <div className="network-panel-top"><div className="network-toggle"><button className={selected==='testnet'?'active':''} onClick={()=>setSelected('testnet')}>TESTNET</button><button className={selected==='mainnet'?'active':''} onClick={()=>setSelected('mainnet')}>MAINNET</button></div><span className="network-state"><i/>{network.status}</span></div>
    <div className="network-panel-main">
      <div className="network-identity"><div className="network-logo"><img src="/rabbit-mark.png" alt=""/></div><div><span>RABBIT NETWORK</span><h3>{network.name}</h3><p>{selected==='testnet'?'Public validation environment prepared for miners, nodes and developers.':'Production network configuration prepared for the official mainnet launch.'}</p></div></div>
      <div className="network-spec-grid"><div><span>CHAIN ID</span><b>{network.chainId}</b></div><div><span>CONSENSUS</span><b>{network.consensus}</b></div><div><span>EXECUTION</span><b>{network.execution}</b></div><div><span>NATIVE ASSET</span><b>{network.currency}</b></div></div>
      <div className="endpoint-list"><div><span>RPC</span><b>{network.rpcUrl.replace('https://','')}</b><em>{network.publicRpcReady?'LIVE':'RESERVED'}</em><button onClick={()=>copy(network.rpcUrl,'RPC')}><Copy size={13}/></button></div><div><span>EXPLORER</span><b>{network.explorerUrl.replace('https://','')}</b><em>{network.publicRpcReady?'LIVE':'RESERVED'}</em><button onClick={()=>copy(network.explorerUrl,'Explorer')}><Copy size={13}/></button></div>{network.faucetUrl && <div><span>FAUCET</span><b>{network.faucetUrl.replace('https://','')}</b><em>{network.publicRpcReady?'LIVE':'RESERVED'}</em><button onClick={()=>copy(network.faucetUrl,'Faucet')}><Copy size={13}/></button></div>}</div>
    </div>
    <div className="network-panel-actions"><span className="eyebrow">NETWORK TOOLS</span><button className="network-primary" onClick={()=>walletState.account?onSwitch(network):onConnect()}><Wallet size={15}/>{walletState.account?(network.publicRpcReady?'ADD / SWITCH NETWORK':'PUBLIC RPC PENDING'):'CONNECT WALLET'}</button><button disabled={!network.publicRpcReady}><ExternalLink size={15}/>OPEN EXPLORER</button><small>Public actions are enabled only when the official endpoint is active.</small></div>
  </div>
}
