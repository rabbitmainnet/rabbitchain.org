import React, { useCallback, useEffect, useState } from 'react'
import { createPublicClient, createWalletClient, custom, http, parseAbi, formatUnits, parseUnits } from 'viem'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, ArrowDownToLine, ArrowUpFromLine, BadgeCheck, CircleDollarSign, Clock3, ExternalLink, Info, RefreshCw, ShieldCheck, Wallet, AlertCircle, CheckCircle2, Settings2 } from 'lucide-react'
import './rabbit-animal-draw-investors.css'

// Rabbit Animal Draw V5 - experiment on Rabbit Testnet, chain 9280.
// Deliberately limited to local development and the dedicated testing wallet.
const POOL='0x71aACe928DaAc5c3Cb85B615E587C1Ba98F94f9c'
const REGISTRY='0x09172Df9932579E6737C66cA5B5dC9689DDB6391'
const TRUSD='0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd'
const NATIVE='0x0000000000000000000000000000000000000000'
const TEST_WALLET='0x730c138B256809F89CBFd17a5f67A698df805c9f'
const RPC='https://rpc-testnet.rabbitchain.org'
const EXPLORER='https://explorer-testnet.rabbitchain.org'
const ENABLE_WRITES=true // Rabbit Testnet 9280; wallet chain validated before signing
const net={id:9280,name:'Rabbit Testnet',nativeCurrency:{name:'Test Rabbit',symbol:'tRAB',decimals:18},rpcUrls:{default:{http:[RPC]}}}
const rpc=createPublicClient({chain:net,transport:http(RPC,{timeout:16000,retryCount:1})})
const poolAbi=parseAbi([
 'function shares(address,address) view returns(uint256)',
 'function totalShares(address) view returns(uint256)',
 'function capitalNAV(address) view returns(uint256)',
 'function maxWithdrawLiquidity(address,address) view returns(uint256)',
 'function pendingLPRewards(address,address) view returns(uint256)',
 'function reserved(address) view returns(uint256)',
 'function outstandingWinnings(address) view returns(uint256)',
 'function exitHead(address) view returns(uint256)',
 'function exitTail(address) view returns(uint256)',
 'function activeExitId(address,address) view returns(uint256)',
 'function exits(address,uint256) view returns(address owner,uint256 remaining,bool cancelled)',
 'function depositNative() payable',
 'function depositToken(address,uint256)',
 'function withdrawLiquidity(address,uint256)',
 'function withdrawProfits(address[])',
 'function requestExit(address,uint256) returns(uint256)',
 'function cancelExit(address)',
 'function processExit(address,uint256)'
])
const registryAbi=parseAbi(['function owner() view returns(address)','function isRegistered(address) view returns(bool)','function isBettingEnabled(address) view returns(bool)','function addSupportedToken(address)','function setTokenStatus(address,uint8)'])
const tokenAbi=parseAbi(['function decimals() view returns(uint8)','function balanceOf(address) view returns(uint256)','function allowance(address,address) view returns(uint256)','function approve(address,uint256) returns(bool)'])
const ASSETS={tRAB:NATIVE,tRUSD:TRUSD}
const display=(v,decimals=18)=>{if(v===undefined||v===null)return '—';const s=formatUnits(v,decimals);const [whole,fraction='']=s.split('.');const w=whole.replace(/\B(?=(\d{3})+(?!\d))/g,',');return fraction?`${w}.${fraction.slice(0,6).replace(/0+$/,'')}`.replace(/\.$/,''):w}
const errorText=e=>e?.shortMessage||e?.cause?.shortMessage||e?.message||String(e)
const readable=(text)=>typeof text==='string'&&text.length>300?text.slice(0,300)+'…':text

export default function RabbitAnimalDrawInvestorPanel({ walletState, onConnect, networkKey }){
 const account=walletState?.account||null
 const chain=Number(walletState?.chainId)
 const correctNetwork=networkKey==='testnet'&&chain===9280
 const canTest=Boolean(ENABLE_WRITES&&correctNetwork&&account)
 const [asset,setAsset]=useState('tRAB')
 const [amount,setAmount]=useState('0.01')
 const [withdrawAmount,setWithdrawAmount]=useState('')
 const [pending,setPending]=useState(false)
 const [refreshSeq,setRefreshSeq]=useState(0)
 const [positions,setPositions]=useState({})
 const [balances,setBalances]=useState({})
 const [decimals,setDecimals]=useState({tRAB:18,tRUSD:6})
 const [tokenActive,setTokenActive]=useState(false)
 const [registered,setRegistered]=useState(false)
 const [owner,setOwner]=useState('')
 const [loading,setLoading]=useState(false)
 const [readErrors,setReadErrors]=useState({})
 const [feedback,setFeedback]=useState(null)
 const [advanced,setAdvanced]=useState(false)
 const [withdrawMode,setWithdrawMode]=useState('instant')
 const selected=positions[asset]
 const d=decimals[asset]
 const activeAsset=ASSETS[asset]
 const availableShares=selected?.shares>0n
 const canWrite=canTest&&!pending
 const connected=Boolean(account&&correctNetwork)
 const refresh=useCallback(async()=>{
   if(!connected){setPositions({});setBalances({});return}
   setLoading(true)
   try{
    const [dec,reg,enabled,admin]=await Promise.all([
      rpc.readContract({address:TRUSD,abi:tokenAbi,functionName:'decimals'}).catch(()=>6),
      rpc.readContract({address:REGISTRY,abi:registryAbi,functionName:'isRegistered',args:[TRUSD]}).catch(()=>false),
      rpc.readContract({address:REGISTRY,abi:registryAbi,functionName:'isBettingEnabled',args:[TRUSD]}).catch(()=>false),
      rpc.readContract({address:REGISTRY,abi:registryAbi,functionName:'owner'}).catch(()=>''),
    ])
    const currentDecimals={tRAB:18,tRUSD:Number(dec)}
    setDecimals(currentDecimals);setRegistered(reg);setTokenActive(enabled);setOwner(admin)
    const entries=await Promise.allSettled(['tRAB','tRUSD'].map(async symbol=>{
      const addr=ASSETS[symbol]
      const read=(functionName,args)=>rpc.readContract({address:POOL,abi:poolAbi,functionName,args})
      const [shares,supply,nav,maximum,rewards,reserve,winnings,exitId,head,tail]=await Promise.all([
       read('shares',[addr,account]),read('totalShares',[addr]),read('capitalNAV',[addr]),
       read('maxWithdrawLiquidity',[addr,account]),read('pendingLPRewards',[addr,account]),
       read('reserved',[addr]),read('outstandingWinnings',[addr]),read('activeExitId',[addr,account]),
       read('exitHead',[addr]),read('exitTail',[addr])
      ])
      const exit=exitId>0n?await read('exits',[addr,exitId]):null
      const value=supply>0n?nav*shares/supply:0n
      const walletBalance=symbol==='tRAB'?await rpc.getBalance({address:account}):await rpc.readContract({address:TRUSD,abi:tokenAbi,functionName:'balanceOf',args:[account]})
      return {symbol,shares,supply,nav,maximum,rewards,reserve,winnings,value,exitId,exit,head,tail,walletBalance}
    }))
    const data={},wallets={},errs={}
    entries.forEach((entry,i)=>{const sym=i===0?'tRAB':'tRUSD';if(entry.status==='fulfilled'){data[sym]=entry.value;wallets[sym]=entry.value.walletBalance}else{errs[sym]=readable(errorText(entry.reason))}})
    setPositions(data);setBalances(wallets);setReadErrors(errs)
   }catch(e){setReadErrors({general:readable(errorText(e))})}
   finally{setLoading(false)}
 },[account,connected])
 useEffect(()=>{refresh();const interval=setInterval(refresh,30000);return()=>clearInterval(interval)},[refresh,refreshSeq])
 const amountRaw=(str,symbol)=>{
    const value=String(str).trim().replace(',','.')
    if(!/^\d+(?:\.\d+)?$/.test(value))throw Error('Enter a valid positive amount.')
    const raw=parseUnits(value,decimals[symbol]);if(raw<=0n)throw Error('Amount must be greater than zero.')
    return raw
 }
 const send=async(target,functionName,args=[],value=0n,abi=poolAbi)=>{
   if(!canTest)throw Error('Connect a wallet on Rabbit Testnet 9280 to transact.')
   const provider=window.ethereum
   if(!provider?.request)throw Error('MetaMask is required.')
   if(BigInt(await provider.request({method:'eth_chainId'}))!==9280n)throw Error('Select Rabbit Testnet 9280 in MetaMask.')
   const wallets=await provider.request({method:'eth_accounts'})
   if(!wallets.some(a=>a.toLowerCase()===account.toLowerCase()))throw Error('Select your connected Rabbit test wallet in MetaMask.')
   const params={address:target,abi,functionName,args,account,chain:net}
   if(value>0n)params.value=value
   setFeedback({type:'info',message:'Simulating '+functionName+'…'})
   const simulated=await rpc.simulateContract(params)
   const signer=createWalletClient({account,chain:net,transport:custom(provider)})
   const hash=await signer.writeContract(simulated.request)
   setFeedback({type:'info',message:'Waiting for on-chain confirmation…',hash})
   const receipt=await rpc.waitForTransactionReceipt({hash,timeout:120000})
   if(receipt.status!=='success')throw Error('Transaction reverted. Hash: '+hash)
   setFeedback({type:'success',message:'Transaction confirmed on Rabbit Testnet.',hash})
   setRefreshSeq(x=>x+1)
   return hash
 }
 const perform=async(kind)=>{
   if(pending||!canTest)return
   const addr=activeAsset
   setPending(true);setFeedback(null)
   try{
    if(kind==='deposit'){
      const raw=amountRaw(amount,asset)
      if(balances[asset]!==undefined&&raw>balances[asset])throw Error('Insufficient '+asset+' wallet balance.')
      if(asset==='tRAB')await send(POOL,'depositNative',[],raw)
      else{
        if(!tokenActive)throw Error('tRUSD is not active in the V5 Token Registry. Use the administrator settings below.')
        const allowance=await rpc.readContract({address:TRUSD,abi:tokenAbi,functionName:'allowance',args:[account,POOL]})
        if(allowance<raw){await send(TRUSD,'approve',[POOL,raw],0n,tokenAbi)}
        await send(POOL,'depositToken',[TRUSD,raw])
      }
      setAmount('0.01')
    }else if(kind==='profits'){
      if(!selected||selected.rewards===0n)throw Error('No distributable '+asset+' profits to withdraw.')
      await send(POOL,'withdrawProfits',[[addr]])
    }else if(kind==='withdraw'){
      const raw=amountRaw(withdrawAmount,asset)
      if(!selected||selected.value<raw)throw Error('Amount exceeds current on-chain position value.')
      if(withdrawMode==='instant'){
        if(selected.head!==selected.tail)throw Error('FIFO withdrawal queue is active. Select Request Exit.')
        if(raw>selected.maximum)throw Error('Amount exceeds immediately withdrawable liquidity. Select Request Exit.')
        await send(POOL,'withdrawLiquidity',[addr,raw])
      }else{
        if(selected.exitId!==0n)throw Error('You already have an active withdrawal request for this asset.')
        await send(POOL,'requestExit',[addr,raw])
      }
      setWithdrawAmount('')
    }else if(kind==='cancel')await send(POOL,'cancelExit',[addr])
    else if(kind==='process')await send(POOL,'processExit',[addr,8n])
    else if(kind==='activate'){
      if(owner.toLowerCase()!==account.toLowerCase())throw Error('Only the Registry owner may enable tRUSD.')
      if(!registered)throw Error('Register tRUSD first.')
      if(tokenActive)throw Error('tRUSD is already active.')
      await send(REGISTRY,'setTokenStatus',[TRUSD,1],0n,registryAbi)
    }
    else if(kind==='register'){
      if(owner.toLowerCase()!==account.toLowerCase())throw Error('Only the Registry owner can register supported tokens.')
      if(registered)throw Error('tRUSD is already registered.')
      await send(REGISTRY,'addSupportedToken',[TRUSD],0n,registryAbi)
    }
   }catch(e){setFeedback({type:'error',message:readable(errorText(e))})}
   finally{setPending(false);setRefreshSeq(x=>x+1)}
 }
 const exitPending=Boolean(selected?.exitId>0n&&!selected?.exit?.[2]&&selected?.exit?.[1]>0n)
 const readyWithdraw=withdrawAmount.trim().length>0
 let instantAvailable=false
 try{const raw=readyWithdraw?amountRaw(withdrawAmount,asset):0n;instantAvailable=Boolean(selected&&raw<=selected.maximum&&raw<=selected.value&&selected.head===selected.tail)}catch{}
 return <div className="rad-investors rad-investors-pro">
    <header className="rad-investors-hero">
      <div className="rad-investors-overline">RABBIT PLATFORM <span className="rad-pro-slash">/</span> ANIMAL DRAW <span className="rad-pro-slash">/</span> LIQUIDITY</div>
      <div className="rad-investors-heading"><div><h1>Liquidity <span>Pool.</span></h1><p>Provide liquidity, track your position and manage your earnings. One transparent pool per supported currency.</p></div><span className="rad-investors-lab"><span className="rad-pro-led"/> TESTNET 9280</span></div>
      <div className="rad-investors-links"><Link to="/platform/animal-draw"><ArrowLeft size={15}/> Animal Draw</Link><a href={`${EXPLORER}/address/${POOL}?tab=contract`} target="_blank" rel="noopener noreferrer">View on-chain contract <ArrowUpRight size={14}/></a></div>
    </header>
    <section className="rad-pro-topline"><span><ShieldCheck size={16}/> Testnet experiment · No real-value deposits</span><button type="button" onClick={()=>setRefreshSeq(x=>x+1)} disabled={loading||pending}><RefreshCw size={15} className={loading?'rad-spin':''}/> {loading?'Refreshing…':'Refresh on-chain'}</button></section>
    {!account?<div className="rad-investors-connect"><Wallet size={21}/><div><strong>Connect your Rabbit wallet</strong><span>View real balances and pool positions.</span></div><button type="button" onClick={onConnect}>Connect Wallet</button></div>:<div className="rad-investors-connect"><BadgeCheck size={20}/><div><strong>{correctNetwork?'Connected to Rabbit Testnet':'Wrong network'}</strong><span>{account.slice(0,7)}…{account.slice(-5)} · {correctNetwork?'Chain ID 9280':'Switch to Rabbit Testnet 9280'}</span></div><span className="rad-pro-wallet">{canTest?'Rabbit Testnet enabled':'Read-only'}</span></div>}
    {Object.entries(readErrors).map(([sym,error])=><p key={sym} className="rad-pro-alert error"><AlertCircle size={16}/>{sym}: {error}</p>)}
    <section className="rad-pro-main" aria-label="Liquidity account">
      <div className="rad-pro-main-header"><div><span className="rad-pro-eyebrow">MY LIQUIDITY</span><h2>Overview</h2><p>Live balances from Rabbit Testnet. Your positions are separate for each currency.</p></div><div className="rad-pro-assets" role="group" aria-label="Select currency">{['tRAB','tRUSD'].map(sym=><button key={sym} type="button" aria-pressed={asset===sym} className={asset===sym?'active':''} onClick={()=>{setAsset(sym);setWithdrawAmount('');setFeedback(null)}}>{sym}</button>)}</div></div>
      <div className="rad-pro-metrics">
       <article><span>Position value</span><strong>{connected&&selected?display(selected.value,d):'—'} <small>{asset}</small></strong><p>Current share of the pool NAV</p></article>
       <article><span>Available to withdraw</span><strong>{connected&&selected?display(selected.maximum,d):'—'} <small>{asset}</small></strong><p>Immediately withdrawable capital</p></article>
       <article><span>Withdrawable profits</span><strong>{connected&&selected?display(selected.rewards,d):'—'} <small>{asset}</small></strong><p>Credited LP rewards only</p></article>
       <article><span>My wallet balance</span><strong>{connected&&balances[asset]!==undefined?display(balances[asset],d):'—'} <small>{asset}</small></strong><p>Available in your wallet</p></article>
      </div>
      <div className="rad-pro-details"><div><span>My pool shares</span><strong>{selected?display(selected.shares,d):'—'}</strong></div><div><span>Total pool shares</span><strong>{selected?display(selected.supply,d):'—'}</strong></div><div><span>Pool NAV</span><strong>{selected?display(selected.nav,d):'—'} {asset}</strong></div><div><span>Protected bets &amp; prizes</span><strong>{selected?display(selected.reserve+selected.winnings,d):'—'} {asset}</strong></div></div>
      <p className="rad-pro-accuracy"><Info size={15}/> Cost basis and unrealized P&amp;L cannot be reliably reconstructed from these contract reads; no estimates are presented as facts.</p>
    </section>
    <div className="rad-pro-actions-grid">
      <section className="rad-pro-operation">
       <div className="rad-pro-operation-head"><span className="rad-pro-operation-icon"><ArrowDownToLine size={20}/></span><div><h2>Deposit Liquidity</h2><p>Add {asset} to the pool and receive LP shares.</p></div></div>
       <label className="rad-pro-field"><span>Amount to deposit</span><div className="rad-pro-amount"><input type="text" inputMode="decimal" aria-label="Deposit amount" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/><strong>{asset}</strong></div></label>
       <div className="rad-pro-form-caption"><span>Wallet: {balances[asset]!==undefined?display(balances[asset],d):'—'} {asset}</span><span>Deposits are limited by wallet balance and contract rules</span></div>
       {asset==='tRUSD'&&!tokenActive&&<p className="rad-pro-alert warn"><Info size={15}/> tRUSD is not active in the Token Registry. Registration requires the administrator.</p>}
       <button type="button" className="rad-pro-primary" disabled={!canWrite||!selected||!amount.trim()||(asset==='tRUSD'&&!tokenActive)} onClick={()=>perform('deposit')}>{pending?'Transaction pending…':!canTest?'Connect Rabbit Testnet':asset==='tRUSD'?'Approve if needed & Deposit':'Deposit '+asset}</button>
       <p className="rad-pro-small">Every write is simulated before MetaMask requests approval. This is testnet only.</p>
      </section>
      <section className="rad-pro-operation">
       <div className="rad-pro-operation-head"><span className="rad-pro-operation-icon"><ArrowUpFromLine size={20}/></span><div><h2>Withdraw Liquidity</h2><p>Redeem available capital or join the FIFO exit queue.</p></div></div>
       <div className="rad-pro-mode" role="group" aria-label="Withdrawal mode"><button type="button" className={withdrawMode==='instant'?'active':''} onClick={()=>setWithdrawMode('instant')}>Instant</button><button type="button" className={withdrawMode==='queue'?'active':''} onClick={()=>setWithdrawMode('queue')}>Request exit</button></div>
       <label className="rad-pro-field"><span>Withdrawal amount</span><div className="rad-pro-amount"><input type="text" inputMode="decimal" aria-label="Withdrawal amount" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} placeholder="0.00"/><strong>{asset}</strong></div></label>
       <div className="rad-pro-form-caption"><span>{withdrawMode==='instant'?'Available now':'Current position'}: {selected?display(withdrawMode==='instant'?selected.maximum:selected.value,d):'—'} {asset}</span><button type="button" onClick={()=>setWithdrawAmount(selected?formatUnits(withdrawMode==='instant'?selected.maximum:selected.value,d):'')}>MAX</button></div>
       <button type="button" className="rad-pro-secondary" disabled={!canWrite||!selected||!readyWithdraw||Boolean(exitPending)||(withdrawMode==='instant'&&!instantAvailable)} onClick={()=>perform('withdraw')}>{pending?'Transaction pending…':withdrawMode==='instant'?'Withdraw Liquidity':'Request FIFO Withdrawal'}</button>
       {withdrawMode==='instant'&&selected&&selected.head!==selected.tail&&<p className="rad-pro-small">An exit queue is active. Use Request exit instead.</p>}
       {withdrawMode==='instant'&&readyWithdraw&&!instantAvailable&&<p className="rad-pro-small">This amount is not immediately withdrawable. You can request an exit for available position value.</p>}
      </section>
    </div>
    <div className="rad-pro-actions-grid rad-pro-bottom-grid">
      <section className="rad-pro-operation"><div className="rad-pro-operation-head"><span className="rad-pro-operation-icon"><CircleDollarSign size={20}/></span><div><h2>Withdraw Profits</h2><p>Claim accrued rewards without redeeming your LP shares.</p></div></div><div className="rad-pro-profit-amount">{selected?display(selected.rewards,d):'—'} <small>{asset}</small></div><button type="button" className="rad-pro-secondary" disabled={!canWrite||!selected||selected.rewards===0n} onClick={()=>perform('profits')}>Withdraw Profits</button><p className="rad-pro-small">Profits are distributed only when earned and credited on-chain.</p></section>
      <section className="rad-pro-operation"><div className="rad-pro-operation-head"><span className="rad-pro-operation-icon"><Clock3 size={20}/></span><div><h2>Withdrawal Queue</h2><p>FIFO exit requests protect the order of investors.</p></div></div><div className="rad-pro-queue-stats"><span>Current request <strong>{selected?.exitId>0n?'#'+String(selected.exitId):'None'}</strong></span><span>Remaining <strong>{exitPending?display(selected.exit[1],d)+' '+asset:'—'}</strong></span><span>Queue <strong>{selected?String(selected.head)+' / '+String(selected.tail):'—'}</strong></span></div><div className="rad-pro-inline-buttons"><button type="button" disabled={!canWrite||!exitPending} onClick={()=>perform('cancel')}>Cancel request</button><button type="button" disabled={!canWrite||!selected||selected.head===selected.tail} onClick={()=>perform('process')}>Process queue</button></div><p className="rad-pro-small">Processing depends on available capital and outstanding obligations.</p></section>
    </div>
    {feedback&&<div role="status" className={'rad-pro-alert '+feedback.type}>{feedback.type==='success'?<CheckCircle2 size={17}/>:feedback.type==='error'?<AlertCircle size={17}/>:<Clock3 size={17}/>}<span>{feedback.message}{feedback.hash&&<> <a href={`${EXPLORER}/tx/${feedback.hash}`} rel="noopener noreferrer" target="_blank">View transaction <ExternalLink size={12}/></a></>}</span></div>}
    {canTest&&owner.toLowerCase()===account?.toLowerCase()&&<section className="rad-pro-admin"><button type="button" className="rad-pro-admin-toggle" onClick={()=>setAdvanced(!advanced)}><Settings2 size={17}/> Token Registry · Admin settings <span>{advanced?'−':'+'}</span></button>{advanced&&<div className="rad-pro-admin-body"><p>Manage supported currencies separately from investors. tRUSD status: <strong>{tokenActive?'Active':registered?'Registered, not active':'Not registered'}</strong>.</p>{!registered?<button type="button" disabled={pending} onClick={()=>perform('register')}>Register tRUSD on V5</button>:!tokenActive?<button type="button" disabled={pending} onClick={()=>perform('activate')}>Activate tRUSD on V5</button>:<span>tRUSD active</span>}</div>}</section>}
    <div className="rad-pro-footer"><ShieldCheck size={18}/><span><strong>Experimental Testnet Only.</strong> Transactions require a connected wallet on Rabbit Testnet 9280. Funds and LP shares can lose value. This interface has not undergone an independent security audit.</span></div>
  </div>
}
