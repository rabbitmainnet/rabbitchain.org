import { useCallback, useEffect, useState } from 'react'
import { createPublicClient, createWalletClient, custom, http, parseAbi, parseUnits, formatUnits, zeroAddress, isAddress } from 'viem'

const FACTORY = '0x4ffe7e4debf8a897629af714c270181d470591f9'
const COORDINATOR = '0xdFc21aeA108e3F527E5f236ebf354dc8262719da'
const RPC = 'https://rpc-testnet.rabbitchain.org'
const factoryAbi = parseAbi([
  'function roundOfLaunch(uint256) view returns (address)',
  'function allocationsOfLaunch(uint256) view returns (address)',
  'function createLaunchVRF(address,uint256,uint256) returns (address,address)'
])
const roundAbi = parseAbi([
  'function registrationDeadline() view returns (uint256)',
  'function participantCount() view returns (uint256)',
  'function registered(address) view returns (bool)',
  'function requested() view returns (bool)',
  'function settled() view returns (bool)',
  'function winner() view returns (address)',
  'function bridge() view returns (address)',
  'function register()', 'function requestRound() payable returns (bytes32)', 'function settleRound()'
])
const allocAbi = parseAbi([
  'function funded() view returns (bool)', 'function processed() view returns (bool)',
  'function refunded() view returns (bool)', 'function maxWinners() view returns (uint256)',
  'function amountPerWinner() view returns (uint256)',
  'function selected(address) view returns (bool)', 'function claimed(address) view returns (bool)',
  'function fund(uint256)', 'function finalizeAllocations()', 'function claim()'
])
const tokenAbi = parseAbi([
  'function allowance(address,address) view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)'
])
const bridgeAbi = parseAbi(['function quoteFee() view returns (uint256)'])
const rpc = createPublicClient({ transport: http(RPC, {timeout: 25000}) })
const failMessage = e => e?.shortMessage || e?.message || String(e)
const normalize = v => v.trim().replace(',', '.')
const shorten = v => v ? `${v.slice(0,8)}…${v.slice(-6)}` : '—'

export default function RabbitLaunchVRFPanel({ item, walletState, walletProvider }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deadlineHours, setDeadlineHours] = useState('24')
  const [winners, setWinners] = useState('2')
  const [perWinner, setPerWinner] = useState('10')
  const account = walletState?.account
  const connected = !!account && Number(walletState?.chainId) === 9280 && !!walletProvider?.request
  const token = item.fields?.token
  const decimals = Number(item.decimals ?? 18)
  const isCreator = Boolean(account && item.fields?.creator?.toLowerCase() === account.toLowerCase())
  const launchId = BigInt(item.id)
  const valid = item.version === 3 && isAddress(token || '')

  const reload = useCallback(async () => {
    if (!valid) return
    try {
      const [round, allocations] = await Promise.all([
        rpc.readContract({ address: FACTORY, abi: factoryAbi, functionName: 'roundOfLaunch', args: [launchId] }),
        rpc.readContract({ address: FACTORY, abi: factoryAbi, functionName: 'allocationsOfLaunch', args: [launchId] })
      ])
      if (round === zeroAddress || allocations === zeroAddress) {
        setState({ exists: false }); setError(''); return
      }
      const [deadline, count, requested, settled, winner, funded, processed, refunded, maxWinners, amount, registered, selected, claimed] = await Promise.all([
        rpc.readContract({address:round,abi:roundAbi,functionName:'registrationDeadline'}),
        rpc.readContract({address:round,abi:roundAbi,functionName:'participantCount'}),
        rpc.readContract({address:round,abi:roundAbi,functionName:'requested'}),
        rpc.readContract({address:round,abi:roundAbi,functionName:'settled'}),
        rpc.readContract({address:round,abi:roundAbi,functionName:'winner'}),
        rpc.readContract({address:allocations,abi:allocAbi,functionName:'funded'}),
        rpc.readContract({address:allocations,abi:allocAbi,functionName:'processed'}),
        rpc.readContract({address:allocations,abi:allocAbi,functionName:'refunded'}),
        rpc.readContract({address:allocations,abi:allocAbi,functionName:'maxWinners'}),
        rpc.readContract({address:allocations,abi:allocAbi,functionName:'amountPerWinner'}),
        account ? rpc.readContract({address:round,abi:roundAbi,functionName:'registered',args:[account]}) : false,
        account ? rpc.readContract({address:allocations,abi:allocAbi,functionName:'selected',args:[account]}) : false,
        account ? rpc.readContract({address:allocations,abi:allocAbi,functionName:'claimed',args:[account]}) : false
      ])
      setState({exists:true,round,allocations,deadline,count,requested,settled,winner,funded,processed,refunded,maxWinners,amount,registered,selected,claimed})
      setError('')
    } catch(e) {setError(`Unable to load VRF round: ${failMessage(e)}`)}
  }, [valid, token, item.id, account])
  useEffect(() => { reload() }, [reload])

  async function send(address, abi, functionName, args=[], value) {
    if (!connected) throw Error('Connect your wallet on Rabbit Testnet 9280')
    const chainId = await walletProvider.request({method:'eth_chainId'})
    if (BigInt(chainId) !== 9280n) throw Error('Switch to Rabbit Testnet 9280')
    const client = createWalletClient({transport:custom(walletProvider)})
    const request = {account, address, abi, functionName, args, chain:null, ...(value !== undefined ? {value} : {})}
    const {request:simulated} = await rpc.simulateContract(request)
    const hash = await client.writeContract(simulated)
    const receipt = await rpc.waitForTransactionReceipt({hash, timeout:120000})
    if (receipt.status !== 'success') throw Error(`Transaction reverted: ${hash}`)
    return receipt
  }
  async function act(fn) {
    if (busy) return
    setBusy(true); setError('')
    try { await fn(); await reload() }
    catch(e) { setError(failMessage(e)) }
    finally { setBusy(false) }
  }
  const now = Math.floor(Date.now()/1000)
  const beforeDeadline = state?.exists && now < Number(state.deadline)
  const inRequestWindow = state?.exists && now >= Number(state.deadline) && now < Number(state.deadline)+7*86400
  const create = () => act(async () => {
    if (!isCreator) throw Error('Only the registered token creator can create this VRF round')
    const n = Number(winners), hours = Number(deadlineHours)
    if (!Number.isInteger(n) || n < 1 || n > 32) throw Error('Choose 1 to 32 winners')
    if (!Number.isInteger(hours) || hours < 1 || hours > 24*30) throw Error('Choose 1 to 720 registration hours')
    const block = await rpc.getBlock()
    const deadline = BigInt(block.timestamp) + BigInt(hours*3600)
    await send(FACTORY,factoryAbi,'createLaunchVRF',[token,deadline,BigInt(n)])
  })
  const fund = () => act(async () => {
    if (!isCreator) throw Error('Connect the creator wallet to fund this round')
    const per = parseUnits(normalize(perWinner), decimals)
    if (per <= 0n) throw Error('Enter a positive token quantity')
    const total = per * state.maxWinners
    const [balance, allowance] = await Promise.all([
      rpc.readContract({address:token,abi:tokenAbi,functionName:'balanceOf',args:[account]}),
      rpc.readContract({address:token,abi:tokenAbi,functionName:'allowance',args:[account,state.allocations]})
    ])
    if (balance < total) throw Error('Not enough unlocked token balance to fund the round')
    if (allowance < total) await send(token,tokenAbi,'approve',[state.allocations,total])
    await send(state.allocations,allocAbi,'fund',[per])
  })
  const join = () => act(() => send(state.round,roundAbi,'register'))
  const request = () => act(async () => {
    const bridge = await rpc.readContract({address:state.round,abi:roundAbi,functionName:'bridge'})
    const fee = await rpc.readContract({address:bridge,abi:bridgeAbi,functionName:'quoteFee'})
    await send(state.round,roundAbi,'requestRound',[],fee)
  })
  const settle = () => act(() => send(state.round,roundAbi,'settleRound'))
  const finalize = () => act(() => send(state.allocations,allocAbi,'finalizeAllocations'))
  const claim = () => act(() => send(state.allocations,allocAbi,'claim'))

  if (!valid) return null
  return <section className="rlp-vrf-card" aria-label="Rabbit VRF allocation round">
    <div className="rlp-vrf-heading"><div><span className="rlp-vrf-kicker">RABBIT VRF · VERIFIABLE ALLOCATION</span><h3>Fair Draw</h3><p>Mandatory on-chain VRF verification for fair launch allocation.</p></div><span className="rlp-vrf-spark">✦</span></div>
    {state === null ? <p>Loading on-chain VRF status…</p> : !state.exists ? <>
      <p>No VRF draw has been created for this token.</p>
      {isCreator && <div className="rlp-vrf-controls">
        <label>Registration period (hours)<input value={deadlineHours} onChange={e=>setDeadlineHours(e.target.value)} inputMode="numeric" placeholder="24" /></label>
        <label>Number of winners (1–32)<input value={winners} onChange={e=>setWinners(e.target.value)} inputMode="numeric" placeholder="2" /></label>
        <button type="button" disabled={busy || !connected} onClick={create}>Create Fair Draw</button>
        <small>Creation deploys a dedicated Round and Allocations contract. You will then fund prizes separately.</small>
      </div>}
      {!isCreator && <small>Only the token creator can create this draw. Check back for open registration.</small>}
    </> : <>
      <div className="rlp-vrf-stats"><div><small>Participants</small><strong>{state.count.toString()}</strong></div><div><small>Winners</small><strong>{state.maxWinners.toString()}</strong></div><div><small>Prize per winner</small><strong>{formatUnits(state.amount,decimals)} {item.symbol}</strong></div></div>
      <p className="rlp-vrf-note">Registration ends: {new Date(Number(state.deadline)*1000).toLocaleString()} · {state.processed ? 'Results finalized' : state.requested ? 'Draw requested' : beforeDeadline ? 'Registration phase' : 'Registration closed'}</p>
      {!state.funded && beforeDeadline && isCreator && <div className="rlp-vrf-controls"><label>Tokens per winner<input value={perWinner} onChange={e=>setPerWinner(e.target.value)} inputMode="decimal" /></label><button type="button" disabled={busy || !connected} onClick={fund}>Fund Prize Pool</button><small>Tokens are transferred into the allocation contract; do not use tokens already committed to another market.</small></div>}
      {state.funded && beforeDeadline && !state.registered && <button type="button" disabled={busy || !connected} onClick={join}>Join Fair Draw</button>}
      {state.registered && <p className="rlp-vrf-good">You're registered for this round.</p>}
      {state.funded && inRequestWindow && !state.requested && state.count >= 2n && <button type="button" disabled={busy || !connected} onClick={request}>Request Rabbit VRF Draw</button>}
      {state.requested && !state.settled && <button type="button" disabled={busy || !connected} onClick={settle}>Finalize VRF Result</button>}
      {state.settled && !state.processed && <button type="button" disabled={busy || !connected} onClick={finalize}>Select Winning Allocations</button>}
      {state.processed && <p className="rlp-vrf-good">{state.selected ? 'You were selected!' : 'Winning allocations have been finalized.'}</p>}
      {state.processed && state.selected && !state.claimed && <button type="button" disabled={busy || !connected} onClick={claim}>Claim {formatUnits(state.amount,decimals)} {item.symbol}</button>}
      {state.claimed && <p className="rlp-vrf-good">Your prize has been claimed.</p>}
      {state.funded && !state.requested && !beforeDeadline && state.count < 2n && <p>Draw requires at least two registered participants. Recovery of unused prizes is governed by the contract timeout.</p>}
      <div className="rlp-vrf-links"><a href={`https://explorer-testnet.rabbitchain.org/address/${state.round}`} target="_blank" rel="noreferrer">Round contract ↗</a><a href={`https://explorer-testnet.rabbitchain.org/address/${state.allocations}`} target="_blank" rel="noreferrer">Prize escrow ↗</a><button type="button" className="rlp-vrf-refresh" onClick={reload}>Refresh status ↻</button></div>
    </>}
    {error && <p className="rlp-vrf-error" role="alert">{error}</p>}
    <small>One entry per wallet is enforced on-chain; this does not prevent multiple wallets per person. VRF results require a completed coordinator request.</small>
  </section>
}
