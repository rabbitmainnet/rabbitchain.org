import { useEffect, useMemo, useState } from 'react'
import { Activity, Blocks, Clock3, Fuel, Radio } from 'lucide-react'
import { NETWORKS } from '../config/networks'

function hexToNumber(value){
  if(!value)return null
  const n=Number.parseInt(value,16)
  return Number.isFinite(n)?n:null
}

function formatGwei(value){
  const wei=hexToNumber(value)
  if(wei===null)return '—'
  return `${(wei/1e9).toFixed(2)} gwei`
}

export default function NetworkPulse(){
  const network=NETWORKS.testnet
  const [state,setState]=useState({loading:false,online:false,block:null,chainId:null,gas:null,updated:null,error:null})

  useEffect(()=>{
    if(!network.publicRpcReady)return
    let stopped=false
    let timer
    const load=async()=>{
      const controller=new AbortController()
      const timeout=setTimeout(()=>controller.abort(),5500)
      setState((s)=>({...s,loading:true,error:null}))
      try{
        const payload=[
          {jsonrpc:'2.0',method:'eth_chainId',params:[],id:1},
          {jsonrpc:'2.0',method:'eth_blockNumber',params:[],id:2},
          {jsonrpc:'2.0',method:'eth_gasPrice',params:[],id:3}
        ]
        const res=await fetch(network.rpcUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal})
        if(!res.ok)throw new Error(`RPC ${res.status}`)
        const json=await res.json()
        const byId=Object.fromEntries((Array.isArray(json)?json:[json]).map((x)=>[x.id,x.result]))
        if(stopped)return
        setState({loading:false,online:true,chainId:hexToNumber(byId[1]),block:hexToNumber(byId[2]),gas:formatGwei(byId[3]),updated:new Date(),error:null})
      }catch(error){
        if(stopped)return
        setState((s)=>({...s,loading:false,online:false,error:error?.message||'RPC unavailable'}))
      }finally{clearTimeout(timeout)}
      timer=setTimeout(load,20000)
    }
    load()
    return()=>{stopped=true;clearTimeout(timer)}
  },[network.publicRpcReady,network.rpcUrl])

  const items=useMemo(()=>[
    [Blocks,'Latest block',state.block?.toLocaleString()||'—'],
    [Radio,'Chain ID',state.chainId||network.chainId],
    [Fuel,'Gas price',state.gas||'—'],
    [Clock3,'Target block','~10 sec']
  ],[state.block,state.chainId,state.gas,network.chainId])

  if(!network.publicRpcReady){
    return <section className="network-pulse pending" aria-label="Rabbit Testnet network pulse">
      <div className="network-pulse-head"><div><span>LIVE NETWORK PULSE</span><h3>Ready for public telemetry.</h3></div><div className="pulse-state"><i/>ACTIVATION PENDING</div></div>
      <p>The portal is already wired for live block height, chain ID and gas data. Telemetry activates automatically when the official public RPC flag is enabled.</p>
      <div className="network-pulse-grid">{items.map(([Icon,label,value])=><div key={label}><Icon size={18}/><span>{label}</span><strong>{value}</strong></div>)}</div>
    </section>
  }

  return <section className={`network-pulse ${state.online?'online':'offline'}`} aria-live="polite">
    <div className="network-pulse-head"><div><span>LIVE NETWORK PULSE</span><h3>Rabbit Testnet telemetry.</h3></div><div className="pulse-state"><i/>{state.loading?'REFRESHING':state.online?'ONLINE':'RPC CHECK'}</div></div>
    <div className="network-pulse-grid">{items.map(([Icon,label,value])=><div key={label}><Icon size={18}/><span>{label}</span><strong>{value}</strong></div>)}</div>
    <small>{state.updated?`Updated ${state.updated.toLocaleTimeString()}`:state.error||'Checking public RPC…'}</small>
  </section>
}
