import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, ExternalLink, Info, LockKeyhole, ShieldCheck, Ticket, Wallet, Zap, ArrowRight, CheckCircle2, Search, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react'
import { createPublicClient, createWalletClient, custom, http, parseAbi, parseAbiItem, formatUnits, parseUnits, decodeEventLog } from 'viem'
import './rabbit-animal-draw.css'
import './rabbit-animal-draw-liquidity.css'

const CONTRACT='0x71aACe928DaAc5c3Cb85B615E587C1Ba98F94f9c'
const DRAW='0xb08c08DDeEa325D2b3C9E15F0E6923333199B27C'
const ZERO='0x0000000000000000000000000000000000000000'
// Only a controlled local test is allowed. Production builds have writes disabled.
const V5_TEST_WRITES=true // Rabbit Testnet 9280; wallet chain validated before signing
const V5_TEST_WALLET='0x730c138B256809F89CBFd17a5f67A698df805c9f'
const V5_READ_ONLY=!V5_TEST_WRITES
const DEPLOY_TX='0x0029a5bf4625100d954c7b178de714cd84719fffbf82646e6f73942d694dfdb4'
const RPC='https://rpc-testnet.rabbitchain.org'
const TOKEN='0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd'
const EXPLORER='https://explorer-testnet.rabbitchain.org'
const ANIMALS=['Ostrich','Eagle','Donkey','Butterfly','Dog','Goat','Ram','Camel','Snake','Rabbit','Horse','Elephant','Rooster','Cat','Alligator','Lion','Monkey','Pig','Peacock','Turkey','Bull','Tiger','Bear','Deer','Cow']
// Numbered art assets match the deployed V5 group order; contract rules remain unchanged.
const animalArt=group=>`/animal-draw/animals/${pad(group)}.webp`
const animalFallback=group=>`/animal-draw/${ANIMALS[group-1].toLowerCase()}.png`
const fallbackArt=(event,group)=>{const img=event.currentTarget;img.onerror=null;img.src=animalFallback(group)}
const GAME_TYPES=[{name:'Animal / Group',id:0,description:'Choose one animal (01–25)'},{name:'Two Digits',id:1,description:'00–99'},{name:'Three Digits',id:2,description:'000–999'},{name:'Four Digits',id:3,description:'0000–9999'},{name:'Group Double',id:4,description:'Two group picks'},{name:'Group Triple',id:5,description:'Three group picks'},{name:'Two-Digit Double',id:6,description:'Two two-digit picks'},{name:'Two-Digit Triple',id:7,description:'Three two-digit picks'},{name:'Four-Digit Permutation',id:8,description:'All distinct permutations'},{name:'Group Pass',id:9,description:'First against 2nd–5th'}]
const SINGLE_MODES=new Set([0,1,2,3])
const MODE_NAMES=['Animal / Group','Two Digits','Three Digits','Four Digits','Group Double','Group Triple','Two-Digit Double','Two-Digit Triple','Four-Digit Permutation','Group Pass']
const ABI=parseAbi([
 'function tickets(uint256) view returns(address player,address asset,uint64 roundId,uint16 pick,uint8 mode,uint8 scope,uint256 stake,uint256 maxPayout,bool settled)',
 'function claimable(address,address) view returns(uint256)',
 'function nextTicketId() view returns(uint256)',
 'function getCombinationPicks(uint256) view returns(uint16[3])',
 'function quote(uint8,uint8,uint16,uint256) pure returns(uint256)',
 'function combinationQuote(uint8,uint8,uint16[3],uint256) pure returns(uint256)',
 'function placeNative(uint256,uint8,uint8,uint16) payable returns(uint256)',
 'function placeToken(uint256,address,uint8,uint8,uint16,uint256) returns(uint256)',
 'function placeCombinationNative(uint256,uint8,uint8,uint16[3]) payable returns(uint256)',
 'function placeCombinationToken(uint256,address,uint8,uint8,uint16[3],uint256) returns(uint256)',
 'function withdrawWinnings(address[])',
])
const REGISTRY='0x09172Df9932579E6737C66cA5B5dC9689DDB6391'
const REGISTRY_ABI=parseAbi(['function isBettingEnabled(address) view returns(bool)'])
const POOL_ABI=parseAbi(['function capitalNAV(address) view returns(uint256)','function reserved(address) view returns(uint256)','function outstandingWinnings(address) view returns(uint256)'])
const DRAW_ABI=parseAbi([
 'function firstRoundId() view returns(uint256)',
 'function mayPlaceBet(uint256,address) view returns(bool)',
 'function getRound(uint256) view returns(bytes32,bool,bool,uint16[5],bytes32)',
])
const ERC20_ABI=parseAbi(['function allowance(address,address) view returns (uint256)','function balanceOf(address) view returns (uint256)','function approve(address,uint256) returns (bool)'])
const TICKET_EVENT=parseAbiItem('event TicketPlaced(uint256 indexed id, uint256 indexed roundId, address indexed player, address asset, uint256 stake, uint256 maxPayout)')
const FINAL_EVENT=parseAbiItem('event DrawFinalized(uint256 indexed roundId, bytes32 indexed requestId, uint16[5] results, bytes32 proofHash)')
const SETTLED_EVENT=parseAbiItem('event TicketSettled(uint256 indexed id, address indexed player, uint256 payout)')
const network={id:9280,name:'Rabbit Testnet',nativeCurrency:{name:'Test Rabbit',symbol:'tRAB',decimals:18},rpcUrls:{default:{http:[RPC]}}}
const client=createPublicClient({chain:network,transport:http(RPC,{timeout:14000,retryCount:1})})
const pad=n=>String(n).padStart(2,'0')
const groupNumbers=n=>Array.from({length:4},(_,j)=>pad((((n-1)*4+j+1)%100))).join(' · ')
const dateUTC=ms=>new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'UTC',hourCycle:'h23'}).format(ms)+' UTC'
const localDate=ms=>new Intl.DateTimeFormat(undefined,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(ms)
const timeLocal=ms=>new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(ms)
const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'Browser local time'
const nextHour=ms=>Math.floor(ms/3600000)*3600000+3600000
const toId=ms=>Math.floor(ms/3600000)
const formatAmount=(raw, currency)=>Number(formatUnits(BigInt(raw),currency===0?6:18)).toLocaleString('en-US',{maximumFractionDigits:6})
const shortAddress=v=>v?`${v.slice(0,7)}…${v.slice(-5)}`:'—'
const roundStatus=r=>r?.drawn?'Finalized':r?.requested?'Awaiting VRF':'Not requested'
const read=async(fn,args=[])=>{
  if(fn==='firstRoundId')return client.readContract({address:DRAW,abi:DRAW_ABI,functionName:'firstRoundId'})
  if(fn==='rounds'){
    const r=await client.readContract({address:DRAW,abi:DRAW_ABI,functionName:'getRound',args})
    return [r[0],r[1],r[2],0n,0n,0n]
  }
  if(fn==='resultAt'){
    const r=await client.readContract({address:DRAW,abi:DRAW_ABI,functionName:'getRound',args:[args[0]]})
    return r[3][Number(args[1])]
  }
  if(fn==='maximumLiability'){
    if(Number(args[0])>3)return client.readContract({address:CONTRACT,abi:ABI,functionName:'combinationQuote',args:[args[0],args[1],args[4]||[args[2],0,0],args[3]]})
    return client.readContract({address:CONTRACT,abi:ABI,functionName:'quote',args})
  }
  if(fn==='claimable')return client.readContract({address:CONTRACT,abi:ABI,functionName:'claimable',args:[args[0],TOKEN]})
  if(fn==='claimableNative')return client.readContract({address:CONTRACT,abi:ABI,functionName:'claimable',args:[args[0],ZERO]})
  if(fn==='tickets'){
    const t=await client.readContract({address:CONTRACT,abi:ABI,functionName:'tickets',args})
    return [t[0],t[2],t[4],t[5],t[1].toLowerCase()===ZERO?1:0,t[3],t[6],t[7],t[8]]
  }
  throw Error('UNSUPPORTED_V5_READ_'+fn)
}
// All ticket fields are reconstructed from the deployed V5.7 contract, not browser storage.
const ticketAsset=details=>Number(details[4])===0?'tRUSD':'tRAB'
const ticketPickLabel=(details,combination)=>{
  const mode=Number(details[2]),first=Number(details[5])
  const picks=mode>=4?(combination||[]).map(Number):[first]
  if(mode>=4 && picks.length===0)return 'Combination picks unavailable'
  const count=[5,7].includes(mode)?3:mode===8?1:mode>=4?2:1
  const groupMode=[0,4,5,9].includes(mode)
  const width=mode===2?3:[3,8].includes(mode)?4:2
  const label=v=>groupMode?`Group ${pad(v)} · ${ANIMALS[v-1]||'Unknown'}`:String(v).padStart(width,'0')
  if(mode===9)return `${label(picks[0])} (1st) → ${label(picks[1])} (2nd–5th)`
  return picks.slice(0,count).map(label).join(' / ')
}
const drawResultLabel=v=>{
  const n=Number(v),tail=n%100,group=tail===0?25:Math.floor((tail-1)/4)+1
  return {number:String(n).padStart(4,'0'),animal:ANIMALS[group-1]||'Unknown',group}
}
async function getSettlementPayout(id,fromBlock,top){
  let start=fromBlock
  while(start<=top){
    const end=start+1499n<top?start+1499n:top
    const logs=await client.getLogs({address:CONTRACT,event:SETTLED_EVENT,args:{id},fromBlock:start,toBlock:end})
    if(logs.length)return logs.at(-1).args.payout
    start=end+1n
  }
  return null
}
async function fetchPublicTicket(id){
  const [next,deployment,top]=await Promise.all([
    client.readContract({address:CONTRACT,abi:ABI,functionName:'nextTicketId'}),
    client.getTransactionReceipt({hash:DEPLOY_TX}),client.getBlockNumber()
  ])
  if(id<=0n||id>=next)throw Error('Ticket not found on Rabbit Testnet.')
  const details=await read('tickets',[id])
  if(details[0].toLowerCase()===ZERO)throw Error('Ticket not found on Rabbit Testnet.')
  const mode=Number(details[2]),roundId=details[1]
  const [round,combination,payout]=await Promise.all([
    client.readContract({address:DRAW,abi:DRAW_ABI,functionName:'getRound',args:[roundId]}),
    mode>=4?client.readContract({address:CONTRACT,abi:ABI,functionName:'getCombinationPicks',args:[id]}):Promise.resolve(null),
    details[8]?getSettlementPayout(id,deployment.blockNumber,top):Promise.resolve(null)
  ])
  return {id,roundId,details,combination,draw:{requested:round[1],drawn:round[2],results:round[2]?round[3].map(Number):[]},payout,tx:null}
}
function TicketReceipt({ticket,onViewResults}){
  const d=ticket.details,mode=Number(d[2]),asset=ticketAsset(d),currency=Number(d[4])
  const settled=Boolean(d[8]),drawn=Boolean(ticket.draw?.drawn)
  const win=settled&&ticket.payout!==null&&ticket.payout>0n
  const state=settled?(ticket.payout===null?'Settled · payout pending lookup':win?'Won · settled':'Settled · no prize'):drawn?'Awaiting settlement':ticket.draw?.requested?'Awaiting VRF':'Awaiting draw'
  return <article className={`rad-ticket-card rad-ticket-detailed rad-receipt ${win?'rad-winning':''}`}>
    <div className="rad-ticket-card-top"><strong><Ticket size={15}/> Ticket #{String(ticket.id)}</strong><span className={`rad-ticket-state ${win?'win':''}`}>{state}</span></div>
    <div className="rad-receipt-grid">
      <div><small>CONTEST</small><strong>#{String(ticket.roundId)}</strong><span>{dateUTC(Number(ticket.roundId)*3600000)}</span></div>
      <div><small>GAME TYPE</small><strong>{MODE_NAMES[mode]||`Mode ${mode}`}</strong><span>{Number(d[3])===0?'1st prize only':'All five prizes'}</span></div>
      <div className="rad-receipt-picks"><small>YOUR BET · SELECTED ANIMALS / NUMBERS</small><strong>{ticketPickLabel(d,ticket.combination)}</strong></div>
      <div><small>STAKE</small><strong>{formatAmount(d[6],currency)} {asset}</strong></div>
      <div><small>MAXIMUM GROSS PAYOUT</small><strong>{formatAmount(d[7],currency)} {asset}</strong></div>
      <div><small>ACTUAL PRIZE</small><strong>{!settled?'Pending settlement':ticket.payout===null?'Not yet indexed':`${formatAmount(ticket.payout,currency)} ${asset}`}</strong></div>
    </div>
    {drawn&&ticket.draw.results?.length===5&&<div className="rad-receipt-results"><small>OFFICIAL DRAW RESULTS · 1ST TO 5TH</small><div>{ticket.draw.results.map((n,i)=>{const r=drawResultLabel(n);return <span key={i}><b>{i+1}. {r.number}</b><small>{r.animal} · Group {pad(r.group)}</small></span>})}</div></div>}
    <div className="rad-ticket-actions"><button type="button" onClick={()=>onViewResults(ticket)}>View contest <ChevronRight size={13}/></button>{ticket.tx&&<a target="_blank" rel="noopener noreferrer" href={`${EXPLORER}/tx/${ticket.tx}`}>Bet transaction <ExternalLink size={12}/></a>}<a target="_blank" rel="noopener noreferrer" href={`${EXPLORER}/address/${CONTRACT}?tab=contract`}>Verify contract <ExternalLink size={12}/></a></div>
  </article>
}

const sleep=t=>new Promise(resolve=>setTimeout(resolve,t))

async function fetchPlayerTickets(address){
  const [deployment,top]=await Promise.all([client.getTransactionReceipt({hash:DEPLOY_TX}),client.getBlockNumber()])
  let start=deployment.blockNumber
  const gathered=[]
  const settlements=new Map()
  // Chunk the public RPC log queries to avoid provider limits. No wallet signatures required.
  while(start<=top){
    const end=start+1499n<top?start+1499n:top
    const [logs,settled]=await Promise.all([
      client.getLogs({address:CONTRACT,event:TICKET_EVENT,args:{player:address},fromBlock:start,toBlock:end}),
      client.getLogs({address:CONTRACT,event:SETTLED_EVENT,args:{player:address},fromBlock:start,toBlock:end})
    ])
    for(const entry of logs)gathered.push({id:entry.args.id,roundId:entry.args.roundId,tx:entry.transactionHash,block:entry.blockNumber})
    for(const entry of settled)settlements.set(String(entry.args.id),entry.args.payout)
    start=end+1n
  }
  gathered.sort((a,b)=>a.id>b.id?-1:1)
  const unique=[...new Map(gathered.map(item=>[String(item.id),item])).values()].slice(0,40)
  const ids=[...new Set(unique.map(item=>String(item.roundId)))]
  const rounds=await Promise.all(ids.map(async id=>{try{const r=await client.readContract({address:DRAW,abi:DRAW_ABI,functionName:'getRound',args:[BigInt(id)]});return [id,{drawn:r[2],requested:r[1],results:r[2]?r[3].map(Number):[]}]}catch{return [id,{drawn:false,requested:false,results:[]}]}}))
  const roundMap=new Map(rounds)
  return Promise.all(unique.map(async item=>{const details=await read('tickets',[item.id]);const combination=Number(details[2])>=4?await client.readContract({address:CONTRACT,abi:ABI,functionName:'getCombinationPicks',args:[item.id]}):null;return {...item,details,combination,draw:roundMap.get(String(item.roundId)),payout:settlements.get(String(item.id))??null}}))
}

export default function RabbitAnimalDrawPanel({walletState,walletProvider,onConnect,onSwitchNetwork,networkKey='testnet'}){
 const [now,setNow]=useState(Date.now())
 const [poolSnapshot,setPoolSnapshot]=useState({loading:true,values:{},error:''})

 useEffect(()=>{
   let alive=true
   const refresh=async()=>{
     const result=await Promise.allSettled([['tRAB',ZERO],['tRUSD',TOKEN]].map(async ([symbol,asset])=>{
       const [nav,reserved,winnings]=await Promise.all([
         client.readContract({address:CONTRACT,abi:POOL_ABI,functionName:'capitalNAV',args:[asset]}),
         client.readContract({address:CONTRACT,abi:POOL_ABI,functionName:'reserved',args:[asset]}),
         client.readContract({address:CONTRACT,abi:POOL_ABI,functionName:'outstandingWinnings',args:[asset]})
       ])
       return {symbol,nav,protected:reserved+winnings}
     }))
     if(!alive)return
     const values={};result.forEach((r,i)=>{if(r.status==='fulfilled')values[r.value.symbol]=r.value})
     setPoolSnapshot({loading:false,values,error:Object.keys(values).length===0?'Pool data temporarily unavailable.':''})
   }
   refresh();const id=setInterval(refresh,60000)
   return ()=>{alive=false;clearInterval(id)}
 },[])

 const [day,setDay]=useState('')
 const [weekOffset,setWeekOffset]=useState(0)
 const [selectedRound,setSelectedRound]=useState(null)
 const [roundQuery,setRoundQuery]=useState('')
 const [historyRound,setHistoryRound]=useState(null)
 const [animal,setAnimal]=useState(9)
 const [animalQuery,setAnimalQuery]=useState('')
 const [ticketFilter,setTicketFilter]=useState('all')
 const [currency,setCurrency]=useState('tRUSD')
 const [gameType,setGameType]=useState(0)
 const [coverage,setCoverage]=useState(0)
 const [stake,setStake]=useState('0.01')
 const [picks,setPicks]=useState(['10','11','12'])
 const [allowance,setAllowance]=useState(null)
 const [tokenBalance,setTokenBalance]=useState(null)
 const [payoutQuote,setPayoutQuote]=useState(null)
 const [tx,setTx]=useState({step:'idle',message:'',hash:null,ticketId:null})
 const [expandedHelp,setExpandedHelp]=useState(-1)
 const [roundData,setRoundData]=useState({loading:false,round:null,results:[],proof:null,error:''})
 const [tickets,setTickets]=useState({loading:false,items:[],error:'',claimTRUSD:null,claimTRAB:null,lastUpdate:null})
 const [ticketIdQuery,setTicketIdQuery]=useState('')
 const [ticketLookup,setTicketLookup]=useState({loading:false,item:null,error:''})
 const [networkState,setNetworkState]=useState({status:'checking',block:null})
 const [latestDraw,setLatestDraw]=useState({loading:true,roundId:null,results:[],finalizeTx:null,error:''})
 const [browsedResultId,setBrowsedResultId]=useState(null)
 const [browsedResult,setBrowsedResult]=useState({loading:false,roundId:null,results:[],error:'',drawn:false})
 const [lastUpdated,setLastUpdated]=useState(null)
 const address=walletState?.account||walletState?.address||null
 const walletOnTestnet=walletState?.chainId == null || Number(walletState.chainId)===9280
 const combined=gameType>=4
 const requiredPicks=gameType===5||gameType===7?3:gameType===8?1:2
 const effectiveScope=[4,5,6,7].includes(gameType)?1:gameType===9?0:coverage
 const currentPickInput=combined?Number(picks[0]):gameType===0?animal+1:Number(picks[0])
 const stakeRaw=useMemo(()=>{try{if(!/^\d+(?:\.\d+)?$/.test(stake))return null;return parseUnits(stake,currency==='tRUSD'?6:18)}catch{return null}},[stake,currency])
 const normalizedPicks=useMemo(()=>{const initial=[currentPickInput,Number(picks[1]),Number(picks[2])];return initial.slice(0,requiredPicks).concat(Array(3-requiredPicks).fill(0))},[currentPickInput,picks,requiredPicks])
 const maxPick=gameType===0?25:gameType===1||gameType===6||gameType===7?99:gameType===2?999:9999
 const isGroupChoice=gameType===0||gameType===4||gameType===5||gameType===9
 useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[])
 // Only show the actual wagerable window: next 24 hours, closing 2 minutes before each draw.
 // Historical draws stay accessible by contest ID and in the results explorer.
 const allSlots=useMemo(()=>Array.from({length:25},(_,i)=>nextHour(now)+i*3600000),[Math.floor(now/3600000)])
 const available=allSlots.filter(ts=>ts-now>120000 && ts<=now+24*3600000)
 const todayUTC=new Date(now).toISOString().slice(0,10)
 const openDays=[...new Set(available.map(ts=>new Date(ts).toISOString().slice(0,10)))]
 const activeDay=openDays.includes(day)?day:(openDays[0]||todayUTC)
 const shown=available.filter(ts=>new Date(ts).toISOString().slice(0,10)===activeDay)
 const roundTime=selectedRound && selectedRound>now+120000 && selectedRound<=now+7*86400000 ? selectedRound:(available[0]||nextHour(now))
 const advanceBettingLimit=now+24*3600000
 const isFuturePreview=roundTime>advanceBettingLimit
 const cutoff=roundTime-120000
 const betRoundId=toId(roundTime)
 const betTS=roundTime
 const selectedId=historyRound ?? betRoundId
 const isHistory=historyRound!==null
 const selectedTS=selectedId*3600000
 const deadlineLeft=Math.max(0,Math.floor((cutoff-now)/1000))
 const countdown=[Math.floor(deadlineLeft/3600),Math.floor(deadlineLeft%3600/60),deadlineLeft%60].map(pad).join(':')
 const drawLeft=Math.max(0,Math.floor((betTS-now)/1000))
 const drawCountdown=[Math.floor(drawLeft/3600),Math.floor(drawLeft%3600/60),drawLeft%60].map(pad).join(':')

 const validate=()=>{if(!betTS||betTS<=now+120000)return 'Choose an open contest at least 2 minutes before the draw.';if(betTS>advanceBettingLimit)return 'This future contest is for preview only. The current V5 contract accepts bets only within 24 hours of the draw.';if(!stakeRaw||stakeRaw<=0n)return 'Enter a valid positive amount. Betting capacity depends on available reserves.';if(normalizedPicks.some((p,i)=>i<requiredPicks && (!Number.isInteger(p)||p<(isGroupChoice?1:0)||p>(isGroupChoice?25:99)))){if(combined && gameType!==8)return 'Enter valid group or two-digit picks.'}if(!combined && (currentPickInput< (gameType===0?1:0)||currentPickInput>maxPick||!Number.isInteger(currentPickInput)))return 'Enter a valid pick.';if(combined){const active=normalizedPicks.slice(0,requiredPicks);if(gameType===8 && (active[0]<0||active[0]>9999))return 'Enter a four-digit pick (0000–9999).';if(gameType!==8 && (active.some(p=>!Number.isInteger(p)||p<(isGroupChoice?1:0)||p>(isGroupChoice?25:99))||new Set(active).size!==active.length))return 'Enter distinct valid picks.';}return null}
 const validationError=validate()

 useEffect(()=>{let live=true;setPayoutQuote(null);if(stakeRaw&&stakeRaw>0n&&currentPickInput>=0&&currentPickInput<=9999){read('maximumLiability',[gameType,effectiveScope,currentPickInput,stakeRaw,normalizedPicks]).then(amount=>{if(live)setPayoutQuote(amount)}).catch(()=>{if(live)setPayoutQuote(null)})}return()=>{live=false}},[gameType,effectiveScope,currentPickInput,stakeRaw])
 const getEip1193=()=>{
   const provider=walletProvider?.request?walletProvider:typeof window!=='undefined'?window.ethereum:null
   if(!provider?.request)throw Error('No browser wallet provider found. Open this page with MetaMask.')
   return provider
 }
 const getWallet=async()=>{
   const provider=getEip1193()
   const ids=await provider.request({method:'eth_chainId'})
   if(BigInt(ids)!==9280n)throw Error('Switch MetaMask to Rabbit Testnet (chain 9280).')
   const addresses=await provider.request({method:'eth_accounts'})
   const account=addresses?.[0]
   if(!account)throw Error('Connect your wallet before continuing.')
   if(address&&account.toLowerCase()!==address.toLowerCase())throw Error('Wallet changed. Reconnect the site before signing.')
   return {account,provider,wallet:createWalletClient({account,chain:network,transport:custom(provider)})}
 }
 const refreshAllowance=useCallback(async()=>{
   if(!address){setAllowance(null);setTokenBalance(null);return}
   try{const [a,b]=await Promise.all([client.readContract({address:TOKEN,abi:ERC20_ABI,functionName:'allowance',args:[address,CONTRACT]}),client.readContract({address:TOKEN,abi:ERC20_ABI,functionName:'balanceOf',args:[address]})]);setAllowance(a);setTokenBalance(b)}catch{setAllowance(null);setTokenBalance(null)}
 },[address])
 useEffect(()=>{refreshAllowance()},[refreshAllowance])
 const transact=async({to,abi,functionName,args=[],value=0n,done})=>{
   if(V5_READ_ONLY)throw Error('Writes are disabled. Local test mode is required.')
   if(!address)throw Error('Connect a wallet to continue.')
   const {account,wallet}=await getWallet()
   const writeArgs={address:to,abi,functionName,args,account,chain:network}
   if(value>0n)writeArgs.value=value
   setTx({step:'pending',message:'Confirm the transaction in MetaMask…',hash:null,ticketId:null})
   const simulated=await client.simulateContract(writeArgs)
   const hash=await wallet.writeContract(simulated.request)
   setTx({step:'mining',message:'Transaction submitted. Waiting for on-chain confirmation…',hash,ticketId:null})
   const receipt=await client.waitForTransactionReceipt({hash,timeout:120000})
   if(receipt.status!=='success')throw Error('Transaction reverted on-chain.')
   if(done)await done(receipt)
   return {hash,receipt}
 }
 const doApprove=async()=>{
   if(!stakeRaw||stakeRaw<=0n)return
   try{setTx({step:'checking',message:'Checking token approval…',hash:null,ticketId:null})
     const current=await client.readContract({address:TOKEN,abi:ERC20_ABI,functionName:'allowance',args:[address,CONTRACT]})
     if(current>=stakeRaw){setAllowance(current);setTx({step:'idle',message:'Approval already sufficient. You can place the bet.',hash:null,ticketId:null});return}
     const {hash}=await transact({to:TOKEN,abi:ERC20_ABI,functionName:'approve',args:[CONTRACT,stakeRaw]})
     await refreshAllowance();setTx({step:'approved',message:'tRUSD approved. Now click Place Bet.',hash,ticketId:null})
   }catch(e){setTx({step:'error',message:e.shortMessage||e.message||'Approval failed',hash:null,ticketId:null})}
 }
 const doBet=async()=>{
   if(validationError){setTx({step:'error',message:validationError,hash:null,ticketId:null});return}
   try{
     const asset=currency==='tRUSD'?TOKEN:ZERO
     const enabled=await client.readContract({address:REGISTRY,abi:REGISTRY_ABI,functionName:'isBettingEnabled',args:[asset]})
     if(!enabled)throw Error('Selected currency has not been enabled by the administrator.')
     const open=await client.readContract({address:DRAW,abi:DRAW_ABI,functionName:'mayPlaceBet',args:[BigInt(betRoundId),asset]})
     if(!open)throw Error('Contest is not accepting bets on-chain.')
     if(currency==='tRUSD'){
       const permitted=await client.readContract({address:TOKEN,abi:ERC20_ABI,functionName:'allowance',args:[address,CONTRACT]})
       setAllowance(permitted)
       if(permitted<stakeRaw)throw Error('Approve tRUSD before placing a bet.')
     }
     const contest=BigInt(betRoundId)
     const args=combined
        ? currency==='tRUSD'?[contest,TOKEN,gameType,effectiveScope,normalizedPicks,stakeRaw]:[contest,gameType,effectiveScope,normalizedPicks]
        : currency==='tRUSD'?[contest,TOKEN,gameType,effectiveScope,currentPickInput,stakeRaw]:[contest,gameType,effectiveScope,currentPickInput]
     const functionName=combined
        ? currency==='tRUSD'?'placeCombinationToken':'placeCombinationNative'
        : currency==='tRUSD'?'placeToken':'placeNative'
     await transact({to:CONTRACT,abi:ABI,functionName,args,value:currency==='tRAB'?stakeRaw:0n,done:async receipt=>{
       let created=null
       for(const log of receipt.logs){
         if(log.address.toLowerCase()!==CONTRACT.toLowerCase())continue
         try{const ev=decodeEventLog({abi:[TICKET_EVENT],data:log.data,topics:log.topics});if(ev.eventName==='TicketPlaced')created=ev.args.id}catch{}
       }
       setTx({step:'success',message:'Test ticket confirmed on-chain!',hash:receipt.transactionHash,ticketId:created===null?null:String(created)})
     }})
     await Promise.all([refreshAllowance(),refreshTickets(),loadRound()])
   }catch(e){setTx(s=>({step:'error',message:e.shortMessage||e.message||'Bet rejected',hash:s.hash,ticketId:null}))}
 }
 const doWithdrawWinnings=async()=>{
   try{
     const {hash}=await transact({to:CONTRACT,abi:ABI,functionName:'withdrawWinnings',args:[[ZERO,TOKEN]]})
     setTx({step:'success',message:'Winnings withdrawn in one transaction.',hash,ticketId:null})
     await Promise.all([refreshTickets(),refreshAllowance()])
   }catch(e){setTx(s=>({step:'error',message:e.shortMessage||e.message||'Withdrawal failed',hash:s.hash,ticketId:null}))}
 }
 const busy=['checking','pending','mining'].includes(tx.step)
 const loadRound=useCallback(async()=>{
   setRoundData(old=>({...old,loading:true,error:''}))
   try{
     const [r,block]=await Promise.all([read('rounds',[BigInt(selectedId)]),client.getBlockNumber()])
     const requested=r[1],drawn=r[2]
     const nums=drawn?await Promise.all(Array.from({length:5},(_,i)=>read('resultAt',[BigInt(selectedId),BigInt(i)]))):[]
     let proof=null
     if(drawn){
       try{const events=await client.getLogs({address:DRAW,event:FINAL_EVENT,args:{roundId:BigInt(selectedId)},fromBlock:block>25000n?block-25000n:0n,toBlock:block});proof=events.at(-1)?.args?.proofHash??null}catch{/* The resultAt contract getters remain authoritative. */}
     }
     setRoundData({loading:false,round:{requestId:r[0],requested,drawn,stakedTRUSD:r[3],stakedTRAB:r[4],tickets:r[5]},results:nums.map(Number),proof,error:''})
     setNetworkState({status:'connected',block:Number(block)})
   }catch(e){setRoundData(v=>({...v,loading:false,error:e?.shortMessage||e?.message||'RPC unavailable'}));setNetworkState(v=>({...v,status:'unavailable'}))}
 },[selectedId])
 useEffect(()=>{loadRound();const handle=setInterval(loadRound,15000);return()=>clearInterval(handle)},[loadRound])
 const refreshLatest=useCallback(async()=>{
   try{
     const block=await client.getBlock({blockTag:'latest'})
     // Limit discovery to the last 24 elapsed UTC draws. No artificial/fake results.
     const last=Math.floor(Number(block.timestamp)/3600)
     let found=null
     for(let cursor=last;cursor>=Math.max(498769,last-23);cursor-=6){
       const group=Array.from({length:Math.min(6,cursor-Math.max(498769,last-23)+1)},(_,i)=>cursor-i)
       const checks=await Promise.all(group.map(async id=>{try{return {id,r:await read('rounds',[BigInt(id)])}}catch{return null}}))
       found=checks.find(item=>item?.r?.[2])
       if(found)break
     }
     if(!found){setLatestDraw({loading:false,roundId:null,results:[],finalizeTx:null,error:''});return}
     const [results,events]=await Promise.all([
       Promise.all(Array.from({length:5},(_,i)=>read('resultAt',[BigInt(found.id),BigInt(i)]))),
       client.getLogs({address:DRAW,event:FINAL_EVENT,args:{roundId:BigInt(found.id)},fromBlock:0n,toBlock:'latest'}).catch(()=>[])
     ])
     setLatestDraw({loading:false,roundId:found.id,results:results.map(Number),finalizeTx:events.at(-1)?.transactionHash??null,error:''})
     setLastUpdated(Date.now())
   }catch(e){setLatestDraw(v=>({...v,loading:false,error:e.shortMessage||e.message||'RPC unavailable'}))}
 },[])
 useEffect(()=>{refreshLatest();const t=setInterval(refreshLatest,45000);return()=>clearInterval(t)},[refreshLatest])

 const refreshTickets=useCallback(async()=>{
   if(!address){setTickets({loading:false,items:[],error:'',claimTRUSD:null,claimTRAB:null,lastUpdate:null});return}
   setTickets(s=>({...s,loading:true,error:''}))
   try{
     const [items,c1,c2]=await Promise.all([fetchPlayerTickets(address),read('claimable',[address]),read('claimableNative',[address])])
     setTickets({loading:false,items,error:'',claimTRUSD:c1,claimTRAB:c2,lastUpdate:Date.now()})
   }catch(e){setTickets(s=>({...s,loading:false,error:`Could not load ticket history: ${e?.shortMessage||e?.message||'RPC error'}`}))}
 },[address])
 useEffect(()=>{refreshTickets();const t=setInterval(refreshTickets,90000);const onFocus=()=>refreshTickets();window.addEventListener('focus',onFocus);return()=>{clearInterval(t);window.removeEventListener('focus',onFocus)}},[refreshTickets])
 const runSearch=(e)=>{e?.preventDefault();const raw=roundQuery.trim();if(!/^\d{1,12}$/.test(raw))return;const id=Number(raw);if(!Number.isSafeInteger(id)||id<498769||id>toId(now+7*86400000))return;setHistoryRound(id)}
 const clearHistory=()=>{setHistoryRound(null);setRoundQuery('')}
 const searchMyTicket=t=>{setHistoryRound(Number(t.roundId));setRoundQuery(String(t.roundId))}
 const lookupTicket=async e=>{
   e?.preventDefault()
   const raw=ticketIdQuery.trim()
   if(!/^[1-9]\d{0,14}$/.test(raw)){setTicketLookup({loading:false,item:null,error:'Enter a valid ticket number.'});return}
   setTicketLookup({loading:true,item:null,error:''})
   try{const item=await fetchPublicTicket(BigInt(raw));setTicketLookup({loading:false,item,error:''})}
   catch(e){setTicketLookup({loading:false,item:null,error:e?.shortMessage||e?.message||'Unable to retrieve ticket.'})}
 }
 const viewLatest=()=>{if(latestDraw.roundId!==null){setHistoryRound(latestDraw.roundId);setRoundQuery(String(latestDraw.roundId))}}
 // Historical prize browsing is read-only; never changes the selected betting round.
 const shownResult=browsedResultId===null?latestDraw:browsedResult
 const displayedResultId=browsedResultId===null?latestDraw.roundId:browsedResultId
 const resultIsFinalized=browsedResultId===null?latestDraw.roundId!==null:Boolean(browsedResult.drawn)
 useEffect(()=>{
   if(browsedResultId===null)return
   let alive=true
   setBrowsedResult({loading:true,roundId:browsedResultId,results:[],error:'',drawn:false})
   client.readContract({address:DRAW,abi:DRAW_ABI,functionName:'getRound',args:[BigInt(browsedResultId)]})
     .then(r=>{if(alive)setBrowsedResult({loading:false,roundId:browsedResultId,results:r[2]?r[3].map(Number):[],error:'',drawn:Boolean(r[2])})})
     .catch(e=>{if(alive)setBrowsedResult({loading:false,roundId:browsedResultId,results:[],error:e.shortMessage||e.message||'RPC unavailable',drawn:false})})
   return()=>{alive=false}
 },[browsedResultId])
 const browseResult=delta=>{const current=displayedResultId;if(current===null)return;const target=current+delta; if(target>=498769 && (latestDraw.roundId===null||target<=latestDraw.roundId))setBrowsedResultId(target===latestDraw.roundId?null:target)}
 const selectCalendarDay=key=>{setDay(key);setSelectedRound(null);setHistoryRound(null);setRoundQuery('')}
 const selectCalendarSlot=ts=>{if(ts<=now+120000){const id=toId(ts);setHistoryRound(id);setRoundQuery(String(id))}else{setHistoryRound(null);setRoundQuery('');setSelectedRound(ts)}}
 const refreshEverything=async()=>{await Promise.all([loadRound(),refreshLatest(),refreshTickets(),refreshAllowance()])}
 // Navigation only: preserve existing forms, contract reads and signing flow.
 const jumpTo=section=>{const target=document.getElementById(`rad-${section}`);const disclosure=target?.closest('details.rad-disclosure');if(disclosure)disclosure.open=true;target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
 const matchingAnimals=ANIMALS.map((name,i)=>({name,i})).filter(({name,i})=>`${name} ${pad(i+1)} ${groupNumbers(i+1)}`.toLowerCase().includes(animalQuery.trim().toLowerCase()))
 const selectQuickAnimal=i=>{setAnimal(i);setGameType(0)}
 const ticketCounts={all:tickets.items.length,pending:0,settled:0,won:0}
 for(const ticket of tickets.items){
   if(!ticket.details[8])ticketCounts.pending++
   else ticketCounts.settled++
   if(ticket.details[8] && ticket.payout!==null && ticket.payout>0n)ticketCounts.won++
 }
 const visibleTickets=tickets.items.filter(ticket=>ticketFilter==='all'||ticketFilter==='pending'&&!ticket.details[8]||ticketFilter==='settled'&&Boolean(ticket.details[8])||ticketFilter==='won'&&Boolean(ticket.details[8])&&ticket.payout!==null&&ticket.payout>0n)
 const presetModes=GAME_TYPES.map(mode=>({id:mode.id,label:mode.name,detail:mode.description}))
 const readyToClaim=Boolean(address && (tickets.claimTRUSD??0n)>0n || address && (tickets.claimTRAB??0n)>0n)
 return <section className="rad-shell rad-enhanced" aria-label="Rabbit Animal Draw">
  <p role="status" className="rad-note">{V5_READ_ONLY?'Testnet · Betting transactions are disabled in this build.':'RABBIT TESTNET · Real on-chain test transactions · Bankroll and prize reserves govern acceptance.'}</p>
  <div className="rad-kicker"><span className="rad-dot"/> RABBIT PLATFORM <span className="rad-sep">/</span> ANIMAL DRAW <span className="rad-tag">TESTNET 9280</span></div>
  <div className="rad-hero rad-hero-v2"><div><p className="rad-eyebrow">24 GLOBAL DRAWS A DAY · VERIFIED RABBIT VRF</p><h1>Rabbit <span>Animal Draw.</span></h1><p className="rad-subtitle">25 animal groups. One global hourly contest. Find draws, follow on-chain results, and keep your tickets together.</p><div className="rad-hero-actions"><a href={`${EXPLORER}/address/${CONTRACT}?tab=contract`} target="_blank" rel="noopener noreferrer" className="rad-primary">V5 testnet contracts <ExternalLink size={15}/></a><a href="/platform/vrf" className="rad-outline">Explore Rabbit VRF <ArrowRight size={15}/></a></div></div><div className="rad-hero-animal"><img src="/animal-draw/rabbit-animal-draw-logo.webp" alt="Rabbit Animal Draw official neon logo"/><div>25 ANIMAL GROUPS <span>·</span> 24 DRAWS / DAY</div></div></div>
  <div className="rad-pool-banner" aria-label="On-chain liquidity pool balances">
    <div className="rad-pool-heading"><div><small>LIVE ON-CHAIN LIQUIDITY</small><h2>Liquidity backing the draws</h2><p>Pool capital (NAV), with reserved bets and outstanding prizes shown separately. Testnet values are not real money.</p></div><a href="/platform/animal-draw-investors">Provide Liquidity <ArrowRight size={15}/></a></div>
    <div className="rad-pool-currencies">{['tRAB','tRUSD'].map(sym=>{const x=poolSnapshot.values[sym];const dec=sym==='tRUSD'?6:18;return <div className="rad-pool-currency" key={sym}><strong>{sym}</strong><div><span>Pool capital (NAV)</span><b>{x?formatAmount(x.nav,dec===6?0:1):'—'}</b></div><div><span>Protected obligations</span><b>{x?formatAmount(x.protected,dec===6?0:1):'—'}</b></div></div>})}</div>
    {poolSnapshot.loading&&<small>Loading live liquidity data…</small>}{poolSnapshot.error&&<small role="status">{poolSnapshot.error}</small>}
  </div>
  <div className="rad-next-draw-banner" role="timer" aria-label="Upcoming UTC contest countdown">
    <div><small>NEXT OPEN CONTEST</small><strong>#{betRoundId} · {dateUTC(betTS)}</strong><span>Betting closes {dateUTC(betTS-120000)} · Local {localDate(betTS)}</span></div>
    <div className="rad-next-draw-timers">
      <div><small>BETTING CLOSES IN</small><strong>{countdown}</strong></div>
      <div><small>DRAW STARTS IN</small><strong>{drawCountdown}</strong></div>
    </div>
  </div>
  <div className="rad-live-highlight" aria-live="polite">
    <div className="rad-live-head"><div><span className="rad-live-eyebrow"><span className="rad-led on"/> VERIFIED DRAW ARCHIVE</span><h2>{displayedResultId!==null?`${browsedResultId===null?'Latest finalized':'Contest result'} · #${displayedResultId}`:'Latest on-chain draw'}</h2><p>{displayedResultId!==null?`${dateUTC(displayedResultId*3600000)} · ${localDate(displayedResultId*3600000)}`:latestDraw.loading?'Looking for finalized contests…':'No finalized draw found within the last 24 hours.'}</p></div><div className="rad-live-actions"><button type="button" onClick={refreshEverything} disabled={latestDraw.loading}><RefreshCw size={15}/> Refresh</button>{latestDraw.roundId!==null&&<button type="button" className="rad-live-primary" onClick={viewLatest}>View draw <ArrowRight size={15}/></button>}</div></div>
    <div className="rad-result-navigation" aria-label="Browse historical contest results"><button type="button" onClick={()=>browseResult(-1)} disabled={displayedResultId===null||displayedResultId<=498769||shownResult.loading}><ChevronLeft size={17}/> Previous draw</button><span>{displayedResultId===null?'No draw selected':`#${displayedResultId}`} <small>{browsedResultId===null?'Latest result':'Historical result'}</small></span><button type="button" onClick={()=>browseResult(1)} disabled={browsedResultId===null||shownResult.loading}>Next draw <ChevronRight size={17}/></button><button type="button" className="rad-latest-link" onClick={()=>setBrowsedResultId(null)} disabled={browsedResultId===null}>Latest</button></div>
    {shownResult.error&&<p className="rad-error" role="status">Results temporarily unavailable: {shownResult.error}</p>}
    {shownResult.loading&&<p className="rad-note" role="status">Checking official on-chain draw…</p>}
    {!shownResult.loading&&resultIsFinalized&&<div className="rad-live-results">{shownResult.results.map((value,i)=>{const group=value%100===0?25:Math.ceil(value%100/4);return <div key={i} className="rad-live-prize"><span>{i+1}{['st','nd','rd','th','th'][i]} Prize</span><img src={animalArt(group)} onError={event=>fallbackArt(event,group)} alt={ANIMALS[group-1]}/><strong>{String(value).padStart(4,'0')}</strong><small>{ANIMALS[group-1]} · Group {pad(group)}</small></div>})}</div>}
    {!shownResult.loading&&displayedResultId!==null&&!resultIsFinalized&&<div className="rad-archive-pending"><ShieldCheck size={20}/> Contest #{displayedResultId} is not finalized on-chain yet. No results are shown until the Rabbit VRF draw is complete.</div>}
    {browsedResultId===null&&latestDraw.finalizeTx&&<a className="rad-live-verified" target="_blank" rel="noreferrer" href={`${EXPLORER}/tx/${latestDraw.finalizeTx}`}><ShieldCheck size={15}/> Finalization transaction on Rabbit Explorer <ExternalLink size={13}/></a>}
    {browsedResultId!==null&&resultIsFinalized&&<button type="button" className="rad-archive-view" onClick={()=>{setHistoryRound(browsedResultId);setRoundQuery(String(browsedResultId));jumpTo('draw-explorer')}}>Open contest details <ArrowRight size={14}/></button>}
    <small className="rad-live-disclaimer">Results come directly from the deployed contract. A scheduled draw is not final until the VRF draw has been finalized on-chain.{lastUpdated?` Updated ${new Date(lastUpdated).toLocaleTimeString()}.`:''}</small>
  </div>
  <nav className="rad-v6-shortcuts" aria-label="Quick links">
    <button type="button" onClick={()=>jumpTo('draw-explorer')}><CalendarDays size={15}/> Choose draw</button>
    <button type="button" onClick={()=>jumpTo('animal-picker')}><ShieldCheck size={15}/> Choose animal</button>
    <button type="button" onClick={()=>jumpTo('bet-builder')}><Ticket size={15}/> Place bet</button>
    <button type="button" onClick={()=>jumpTo('draw-results')}><RefreshCw size={15}/> Results</button>
    <button type="button" onClick={()=>jumpTo('my-tickets')}><Wallet size={15}/> My tickets</button>
  </nav>
  <div className="rad-main"><div className="rad-content">
    <div className="rad-panel" id="rad-draw-explorer"><div className="rad-section-head"><div><small>01 / DRAW EXPLORER</small><h2>Find your contest</h2></div><span className="rad-pill">UTC+00:00 · {zone}</span></div>
      <details className="rad-history-lookup"><summary><Search size={15}/> Find a past contest by ID</summary>
      <form className="rad-search" onSubmit={runSearch}><Search size={18}/><input aria-label="Search by contest ID" value={roundQuery} onChange={e=>setRoundQuery(e.target.value)} placeholder="Search contest ID, e.g. 498761" inputMode="numeric"/><button type="submit">Search</button>{isHistory&&<button type="button" className="rad-search-reset" onClick={clearHistory}>Upcoming</button>}</form>
      </details>
      <div className="rad-next-row"><div><small>{isHistory?'SEARCHED CONTEST':'SELECTED CONTEST'}</small><strong>#{selectedId} · {dateUTC(selectedTS)}</strong><span>Entries close {dateUTC(selectedTS-120000)}</span><span className="rad-local-time">Your local draw: {localDate(selectedTS)}</span><span className="rad-local-time">Your local cutoff: {localDate(selectedTS-120000)}</span></div><div className="rad-countdown"><small>STATUS</small><strong className="rad-round-state">{roundData.loading?'Checking…':roundData.round?.drawn?'Finalized':roundData.round?.requested?'Awaiting VRF':selectedTS>now?'Scheduled':'Awaiting draw'}</strong><span>{roundData.round?.tickets?.toString()||'0'} on-chain tickets</span></div></div>
      <div className="rad-calendar-v7" aria-label="Available contests within the next 24 hours">
        <div className="rad-calendar-v7-title"><strong>Choose when to play</strong><span>Open draws only · 24h booking window</span></div>
        <div className="rad-open-days" role="group" aria-label="Available UTC days">
          {openDays.map(key=><button type="button" key={key} className={activeDay===key?'active':''} aria-pressed={activeDay===key} onClick={()=>selectCalendarDay(key)}>
            <span>{key===todayUTC?'Today':'Tomorrow'}</span><strong>{new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'})}</strong>
          </button>)}
        </div>
        <div className="rad-open-hours" role="group" aria-label="Available draw times">
          {shown.map(ts=><button type="button" key={ts} className={betTS===ts&&!isHistory?'active':''} aria-pressed={betTS===ts&&!isHistory} onClick={()=>selectCalendarSlot(ts)}>
            <b>{pad(new Date(ts).getUTCHours())}:00 <small>UTC</small></b><span>{timeLocal(ts)} local</span>
          </button>)}
        </div>
        {available.length===0&&<p>No open contests right now. Please check again shortly.</p>}
        <div className="rad-open-foot"><Clock3 size={14}/> Bets close 2 minutes before each draw. Times are UTC with your local time below.</div>
      </div>
      <p className="rad-note"><Info size={14}/> Official UTC draw, with automatic conversion to your browser's local time. Entries close two minutes before the draw. <strong>{isHistory?'Viewing results only':isFuturePreview?'Preview only — betting opens within 24h':'Cutoff in '+countdown}</strong></p>
    </div>
    <details className="rad-disclosure rad-results-disclosure"><summary><strong>Check full contest results</strong><span>See the five numbers and verified proof for a selected draw</span><ChevronRight size={18}/></summary>
    <div className="rad-panel rad-results" id="rad-draw-results"><div className="rad-section-head"><div><small>04 / VERIFIED VRF</small><h2>Draw results</h2></div><button className="rad-refresh" type="button" onClick={refreshEverything} disabled={roundData.loading}><RefreshCw size={15}/> Refresh</button></div>
      {roundData.error?<p role="alert" className="rad-error">{roundData.error}</p>:roundData.round?.drawn?<><div className="rad-result-grid">{roundData.results.map((v,i)=>{const group=v%100===0?25:Math.ceil((v%100)/4);return <div className="rad-result-card" key={i}><span>PRIZE {i+1}</span><img src={animalArt(group)} onError={event=>fallbackArt(event,group)} alt={ANIMALS[group-1]||'Animal'}/><strong>{pad(v).padStart(4,'0')}</strong><small>{ANIMALS[group-1]} · Group {pad(group)}</small></div>})}</div><p className="rad-note"><CheckCircle2 size={15}/> Finalized on-chain for contest #{selectedId}. {roundData.proof&&<>VRF proof: <code>{shortAddress(roundData.proof)}</code></>}</p></>:<div className="rad-await"><ShieldCheck size={31}/><strong>{roundData.round?.requested?'Awaiting Rabbit VRF finalization':'No finalized result yet'}</strong><span>Results will appear from the verified contract after the round is finalized. No placeholder or simulated draw numbers.</span>{roundData.round?.requested&&<small>Request ID: {shortAddress(roundData.round.requestId)}</small>}</div>}
      <div className="rad-draw-stats"><span>Round #{selectedId}</span><span>tRUSD staked: {formatAmount(roundData.round?.stakedTRUSD??0n,0)}</span><span>tRAB staked: {formatAmount(roundData.round?.stakedTRAB??0n,1)}</span></div>
    </div>
    </details>
    <div className="rad-animals-always" aria-label="Choose one of the 25 animal groups">
    <div className="rad-panel" id="rad-animal-picker"><div className="rad-section-head"><div><small>03 / CHOOSE YOUR ANIMAL</small><h2>Choose an animal below</h2></div><span className="rad-pill">25 GROUPS</span></div><div className="rad-animal-tools"><label><Search size={16}/><input type="search" aria-label="Filter animals by name, group or number" placeholder="Find an animal, group or number…" value={animalQuery} onChange={event=>setAnimalQuery(event.target.value)}/></label><span>{matchingAnimals.length} of 25 animals</span>{animalQuery&&<button type="button" onClick={()=>setAnimalQuery('')}>Clear</button>}</div><div className="rad-animals rad-animals-v2">{matchingAnimals.map(({name,i})=><button type="button" key={name} className={animal===i?'active':''} aria-pressed={animal===i} aria-label={`Select ${name}, group ${pad(i+1)}, numbers ${groupNumbers(i+1)}`} onClick={()=>selectQuickAnimal(i)}><span className="rad-animal-index">{pad(i+1)}</span><img loading="lazy" src={animalArt(i+1)} onError={event=>fallbackArt(event,i+1)} alt={name}/><strong>{name}</strong><small>{groupNumbers(i+1)}</small></button>)}</div><div className="rad-picked"><CheckCircle2 size={17}/><span>Your pick: <strong>{ANIMALS[animal]}</strong> · Group {pad(animal+1)} · {groupNumbers(animal+1)} · Your ticket is updated above</span></div></div>
    </div>
  </div><aside className="rad-bet">
    <div className="rad-panel" id="rad-bet-builder"><div className="rad-section-head"><div><small>02 / PLACE YOUR BET</small><h2>Build your ticket</h2></div><Ticket size={22}/></div><div className="rad-bet-round"><span className="rad-led on"/><div><b>{isFuturePreview?'Previewing future draw':'Betting on upcoming draw'} #{betRoundId}</b><small>{dateUTC(betTS)} · Local {localDate(betTS)}</small></div>{isHistory&&<button type="button" onClick={clearHistory}>Show upcoming</button>}</div><div className="rad-field"><span>PAY WITH</span><div className="rad-toggle"><button className={currency==='tRUSD'?'active':''} type="button" onClick={()=>setCurrency('tRUSD')}>tRUSD</button><button className={currency==='tRAB'?'active':''} type="button" onClick={()=>setCurrency('tRAB')}>tRAB</button></div></div><div className="rad-mode-picker" aria-label="Choose a game type"><div className="rad-mode-picker-title"><strong>CHOOSE YOUR GAME TYPE</strong><span>All 10 ways to play — nothing hidden</span></div>
<div className="rad-mode-grid">{presetModes.map(mode=><button type="button" key={mode.id} className={gameType===mode.id?'active':''} aria-pressed={gameType===mode.id} onClick={()=>setGameType(mode.id)}><b>{mode.label}</b><small>{mode.detail}</small></button>)}</div></div>

{gameType===0&&<div className="rad-animal-current" role="status"><div><span>YOUR ANIMAL</span><strong>{ANIMALS[animal]} · Group {pad(animal+1)}</strong><small>{groupNumbers(animal+1)}</small></div><button type="button" onClick={()=>jumpTo('rad-animal-picker')}>Choose animal below <ChevronRight size={15}/></button></div>}
{gameType!==0&&<div className="rad-pick-inputs">{Array.from({length:combined?requiredPicks:1},(_,i)=><label className="rad-field" key={`${gameType}-${i}`}><span>{gameType===8?'FOUR-DIGIT NUMBER':`PICK ${i+1}`}</span><input type="number" min={isGroupChoice?1:0} max={isGroupChoice?25:gameType===1||gameType===6||gameType===7?99:gameType===2?999:9999} value={picks[i]} onChange={e=>setPicks(old=>old.map((v,j)=>j===i?e.target.value:v))} placeholder={isGroupChoice?'01–25':'Enter your number'}/></label>)}</div>}<div className="rad-field"><span>PRIZE COVERAGE</span><div className="rad-toggle"><button className={coverage===0?'active':''} type="button" disabled={[4,5,6,7].includes(gameType)} onClick={()=>setCoverage(0)}>1st prize</button><button className={coverage===1?'active':''} type="button" disabled={gameType===9} onClick={()=>setCoverage(1)}>1st–5th</button></div></div><label className="rad-field"><span>BET AMOUNT ({currency})</span><input type="number" min="0" step="0.01" value={stake} onChange={e=>setStake(e.target.value)}/></label><div className="rad-stake-presets" aria-label="Quick stake presets"><span>QUICK AMOUNT</span>{['0.01','0.10','1','10'].map(value=><button type="button" key={value} onClick={()=>setStake(value)} aria-pressed={Number(stake)===Number(value)} className={Number(stake)===Number(value)?'active':''}>{value}</button>)}</div><div className="rad-summary"><div><span>Prize positions</span><strong>{effectiveScope===0?'1st prize only':'1st through 5th'}</strong></div><div><span>Selected picks</span><strong>{gameType===0?`${ANIMALS[animal]} · Group ${pad(animal+1)}`:normalizedPicks.slice(0,requiredPicks).map((p,i)=>gameType===8?String(p).padStart(4,'0'):isGroupChoice?pad(p):String(p).padStart(gameType===2?3:gameType===3?4:2,'0')).join(' · ')}</strong></div><div><span>Betting contest</span><strong>#{betRoundId}</strong></div><div><span>Betting draw (UTC)</span><strong>{dateUTC(betTS)}</strong></div><div><span>Your local betting time</span><strong>{localDate(betTS)}</strong></div>{gameType===0&&<div><span>Selected animal</span><strong>{ANIMALS[animal]} · {pad(animal+1)}</strong></div>}<div><span>Asset</span><strong>{currency}</strong></div><div><span>Maximum gross payout</span><strong>{payoutQuote===null?'Checking…':`${formatAmount(payoutQuote,currency==='tRUSD'?0:1)} ${currency}`}</strong></div></div><div className="rad-ticket-preview rad-ticket-preview-v3"><div className="rad-ticket-preview-title"><strong>Review your ticket</strong><span>Step 2 of 3 · Before wallet approval</span></div><span>Contest #{betRoundId} · {currency} · {stake||'0'}</span><small>{MODE_NAMES[gameType]} · {effectiveScope===0?'1st prize':'All five prizes'}</small><small>{currency==='tRUSD'?'Token approval is required only when allowance is insufficient.':'Native tRAB is sent with the bet transaction.'}</small></div>
    {!address?<button className="rad-wallet" type="button" onClick={()=>onConnect?.()}><Wallet size={17}/> Connect wallet</button>:<p className="rad-connected"><CheckCircle2 size={15}/> {shortAddress(address)} {walletOnTestnet?'· Connected':'· Wrong network'}</p>}
    {address&&!walletOnTestnet&&<button className="rad-wallet" type="button" onClick={async()=>{try{await getEip1193().request({method:'wallet_switchEthereumChain',params:[{chainId:'0x2440'}]})}catch(e){setTx({step:'error',message:e.message||'Network switch failed',hash:null,ticketId:null})}}}>Switch to Rabbit Testnet</button>}
    {address&&currency==='tRUSD'&&<p className="rad-allowance">tRUSD available: {tokenBalance===null?'Checking…':formatAmount(tokenBalance,0)} · Approved: {allowance===null?'Checking…':formatAmount(allowance,0)}</p>}
    {validationError&&<p className="rad-inline-warning">{validationError}</p>}
    {address&&walletOnTestnet&&currency==='tRUSD'&&stakeRaw>0n&&(allowance===null||allowance<stakeRaw)?<button className="rad-wallet" type="button" disabled={V5_READ_ONLY||busy||Boolean(validationError)||tokenBalance!==null&&tokenBalance<stakeRaw} onClick={doApprove}><ShieldCheck size={16}/>{busy?'Processing…':'1 · Approve tRUSD'}</button>:<button className="rad-wallet" type="button" disabled={V5_READ_ONLY||busy||!address||!walletOnTestnet||Boolean(validationError)||currency==='tRUSD'&&tokenBalance!==null&&stakeRaw>tokenBalance} onClick={doBet}><Ticket size={17}/>{busy?'Processing…':currency==='tRUSD'?'2 · Place Bet':'Place Bet'}</button>}
    <p className="rad-note"><Info size={14}/> Everything happens here: connect MetaMask, approve tRUSD only if needed, place your bet and track your ticket below. Each transaction requires your confirmation. Testnet assets only.</p>
    {tx.message&&<div className={`rad-tx-state ${tx.step}`} role="status"><strong>{tx.step==='success'?'Confirmed':tx.step==='error'?'Action failed':'Transaction status'}</strong><span>{tx.message}</span>{tx.ticketId&&<><b>Ticket #{tx.ticketId}</b><button type="button" className="rad-view-created-ticket" onClick={async()=>{setTicketIdQuery(String(tx.ticketId));setTicketLookup({loading:true,item:null,error:''});try{const item=await fetchPublicTicket(BigInt(tx.ticketId));setTicketLookup({loading:false,item,error:''});document.getElementById('ticket-lookup')?.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){setTicketLookup({loading:false,item:null,error:e.message||'Unable to load ticket.'})}}}>View my ticket details <ChevronRight size={14}/></button></>}{tx.hash&&<a target="_blank" rel="noreferrer" href={`${EXPLORER}/tx/${tx.hash}`}>View transaction <ExternalLink size={13}/></a>}</div>}
    </div>
    <details className="rad-disclosure"><summary><strong>Find a ticket by ID</strong><span>Public lookup, results and settlement details</span><ChevronRight size={18}/></summary>
    <div className="rad-panel rad-ticket-explorer" id="rad-ticket-lookup"><span id="ticket-lookup" className="rad-anchor" aria-hidden="true"/>
      <div className="rad-section-head"><div><small>05 / TICKET EXPLORER</small><h2>Find a ticket by number</h2></div><Search size={21}/></div>
      <p className="rad-note">Enter a ticket ID to view the original bet, chosen animals or numbers, official draw results, and settlement. No wallet connection required. Ticket records are public on-chain.</p>
      <form className="rad-search" onSubmit={lookupTicket}><Search size={18}/><input value={ticketIdQuery} onChange={e=>setTicketIdQuery(e.target.value)} placeholder="Ticket number, e.g. 3" inputMode="numeric" aria-label="Ticket ID"/><button type="submit" disabled={ticketLookup.loading}>{ticketLookup.loading?'Searching…':'Find Ticket'}</button></form>
      {ticketLookup.error&&<p className="rad-error" role="alert">{ticketLookup.error}</p>}
      {ticketLookup.item&&<TicketReceipt ticket={ticketLookup.item} onViewResults={searchMyTicket}/>}
    </div>
    </details>
    <details className="rad-disclosure"><summary><strong>My tickets and prizes</strong><span>History, pending tickets and withdrawal</span><ChevronRight size={18}/></summary>
    <div className="rad-panel" id="rad-my-tickets"><span id="my-tickets" className="rad-anchor" aria-hidden="true"/>
      <div className="rad-section-head"><div><small>06 / MY TICKETS</small><h2>My on-chain bets</h2></div><button type="button" className="rad-refresh" disabled={!address||tickets.loading} onClick={refreshTickets}><RefreshCw size={15}/> Refresh</button></div>
      {!address?<p className="rad-empty"><Wallet size={24}/> Connect your Rabbit Testnet wallet to see your ticket history. The public ticket search above works without a wallet.</p>:<>
        {tickets.loading&&<p className="rad-note">Loading on-chain ticket history…</p>}
        {tickets.error&&<p role="alert" className="rad-error">{tickets.error}</p>}
        {!tickets.loading&&!tickets.error&&tickets.items.length===0&&<p className="rad-empty">No tickets found for this wallet.</p>}
        <div className="rad-ticket-filters" role="group" aria-label="Filter your tickets">{[{id:'all',label:'All'},{id:'pending',label:'Pending'},{id:'settled',label:'Settled'},{id:'won',label:'Won'}].map(filter=><button type="button" key={filter.id} aria-pressed={ticketFilter===filter.id} className={ticketFilter===filter.id?'active':''} onClick={()=>setTicketFilter(filter.id)}>{filter.label}<span>{ticketCounts[filter.id]}</span></button>)}</div>{!tickets.loading&&!tickets.error&&tickets.items.length>0&&visibleTickets.length===0&&<p className="rad-empty">No tickets match this filter. Choose All to view your complete history.</p>}<div className="rad-ticket-list">{visibleTickets.map(t=><TicketReceipt key={String(t.id)} ticket={t} onViewResults={searchMyTicket}/>)}</div>
        <p className="rad-note"><Info size={14}/> The keeper settles tickets automatically. A settled ticket shows its on-chain prize; winnings can be withdrawn from your connected wallet below.</p>
    <div className={`rad-claim ${tickets.claimTRUSD>0n||tickets.claimTRAB>0n?'rad-claim-ready':''}`}><div className="rad-claim-title"><ShieldCheck size={15}/> Prize wallet · Ready to withdraw when claimable</div><div>Claimable tRUSD <b>{tickets.claimTRUSD===null?'—':formatAmount(tickets.claimTRUSD,0)}</b></div><div>Claimable tRAB <b>{tickets.claimTRAB===null?'—':formatAmount(tickets.claimTRAB,1)}</b></div><div className="rad-claim-buttons"><button type="button" disabled={V5_READ_ONLY||busy||!walletOnTestnet||!address||(tickets.claimTRUSD??0n)+(tickets.claimTRAB??0n)===0n} onClick={doWithdrawWinnings}>Withdraw Winnings · All Tokens</button></div></div></>}</div>
    </details>
    <details className="rad-disclosure"><summary><strong>On-chain connection</strong><span>RPC and contract verification</span><ChevronRight size={18}/></summary>
    <div className="rad-panel rad-chain"><div className="rad-section-head"><div><small>V5 · EXPERIMENTAL</small><h3>On-chain connection</h3></div><Zap size={18}/></div><div className="rad-status"><span className={networkState.status==='connected'?'rad-led on':'rad-led'}/><span>{networkState.status==='connected'?'Rabbit Testnet RPC connected':'Waiting for RPC'}</span>{networkState.block!=null&&<strong>#{networkState.block.toLocaleString('en-US')}</strong>}</div><a href={`${EXPLORER}/address/${CONTRACT}?tab=contract`} target="_blank" rel="noopener noreferrer">{shortAddress(CONTRACT)} <ExternalLink size={14}/></a><p>Ticket and draw data comes from the V5 contracts. Source verification is not a security audit.</p></div>
    </details>
  </aside></div><details className="rad-disclosure rad-guide-disclosure"><summary><strong>Rules, payouts and help</strong><span>All original game instructions in one place</span><ChevronRight size={18}/></summary><div className="rad-panel rad-guide" id="rad-game-guide"><div className="rad-section-head"><div><small>HOW TO PLAY · RULES & PAYOUTS</small><h2>Everything you need to know</h2></div><Info size={21}/></div><div className="rad-guide-grid">{[
 ['Getting started','Connect MetaMask on Rabbit Testnet (chain 9280), pick an open UTC contest, choose an animal or number, select tRAB or tRUSD, review the ticket, then confirm in MetaMask.'],
 ['UTC and local times','There are 24 hourly contests per day. Choose an open UTC contest within the next 24 hours. Local time appears automatically. Bets close 2 minutes before the draw. The V5 contract accepts wagers only up to 24 hours ahead. Older draws remain searchable by contest ID.'],
 ['tRUSD approval and tRAB payment','For tRUSD, the first click grants the game an exact token allowance; when confirmed, the same panel changes to Place Bet. Later bets require a new approval only if allowance is insufficient. tRAB bets send native currency with the transaction and do not require an approval.'],
 ['Single-number games','Group selects one animal (01–25). Ten selects 00–99; Hundred selects 000–999; Thousand selects 0000–9999. Choose First for only the top prize, or All Five for all draw positions.'],
 ['Combination games','Group Double uses two different animal groups; Group Triple uses three. Two-Digit Double and Triple use two or three distinct two-digit numbers. Thousand Permutation matches rearrangements of four digits. Group Pass chooses a first-prize group and one of prizes 2–5 as the second group. The ticket form enforces the required number of picks.'],
 ['Payouts and limits','Typical first-prize payouts: Group 18×, Ten 60×, Hundred 600×, Thousand 4000×. All-five bets and combination games follow their own on-chain payout rules. These are gross payouts including the stake, not guaranteed profit. Each bet must fit the available prize reserve.'],
 ['VRF and results','After the UTC draw time, the authorized keeper requests Rabbit VRF. The result is only displayed when the V5 shared draw contract finalizes on-chain. You can search old contest IDs, inspect all five results and verify the contract in the Explorer. Results may be delayed by the network.'],
 ['Tickets, settlement and prizes','Find a Ticket searches public on-chain records by ticket number. My Tickets shows selected picks, stake, status and draw results for the connected wallet. The keeper settles tickets automatically in batches. Use Withdraw Winnings once to collect all claimable currencies. Losing tickets pay zero.'],
 ['Important testnet notice','Experimental, unaudited software on Rabbit Testnet 9280. tRAB and tRUSD are test assets without cash value. Do not treat displayed stakes or expected rewards as real-money offers. Never share a seed phrase or private key.']
 ].map(([heading,body],i)=><div className="rad-guide-item" key={heading}><button type="button" onClick={()=>setExpandedHelp(v=>v===i?-1:i)} aria-expanded={expandedHelp===i}><span>{heading}</span><ChevronRight size={16} className={expandedHelp===i?'expanded':''}/></button>{expandedHelp===i&&<p>{body}</p>}</div>)}</div></div></details><div className="rad-bottom"><ShieldCheck size={18}/><span>EXPERIMENTAL RABBIT TESTNET · EXPERIMENTAL WALLET TRANSACTIONS · DOUBLE-CHECK METAMASK CONFIRMATIONS · NO MAINNET OR REAL-VALUE WAGERING</span></div>
 </section>
}
