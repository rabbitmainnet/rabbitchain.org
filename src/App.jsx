import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import WalletModal from './components/WalletModal'
import WalletDrawer from './components/WalletDrawer'
import SearchPalette from './components/SearchPalette'
const Home = lazy(() => import('./pages/Home'))
const Testnet = lazy(() => import('./pages/Testnet'))
const Mainnet = lazy(() => import('./pages/Mainnet'))
const Lcq = lazy(() => import('./pages/Lcq'))
const Mining = lazy(() => import('./pages/Mining'))
const Nodes = lazy(() => import('./pages/Nodes'))
const Developers = lazy(() => import('./pages/Developers'))
const Docs = lazy(() => import('./pages/Docs'))
const Community = lazy(() => import('./pages/Community'))
const Platform = lazy(() => import('./pages/Platform'))
const Whitepaper = lazy(() => import('./pages/Whitepaper'))
const Status = lazy(() => import('./pages/Status'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./pages/TermsConditions'))
const RiskDisclosure = lazy(() => import('./pages/RiskDisclosure'))
const NetworkOverview = lazy(() => import('./pages/Network'))
const Rab = lazy(() => import('./pages/Rab'))
const Security = lazy(() => import('./pages/Security'))
const Releases = lazy(() => import('./pages/Releases'))
const Ecosystem = lazy(() => import('./pages/Ecosystem'))
const About = lazy(() => import('./pages/About'))
import BackToTop from './components/BackToTop'
import { clearWalletPreference, connectWallet, connectWalletConnect, detectInjectedWallets, friendlyWalletError, getWalletPreference, getWalletSnapshot, restoreWalletConnect, saveWalletPreference, switchOrAddNetwork } from './lib/wallet'

const META = {
  '/': ['Rabbit Chain — LCQ Layer 1','Rabbit Chain is a permissionless EVM Layer 1 powered by LCQ Consensus. One wallet. One fair chance.'],
  '/network': ['Rabbit Network — LCQ, EVM and P2P','Explore Rabbit Chain network architecture, Testnet/Mainnet identities, public telemetry and participation paths.'],
  '/rab': ['RAB — Native Asset of Rabbit Chain','Learn how RAB is used for Rabbit network fees and LCQ protocol rewards, with a clear separation between Testnet and Mainnet.'],
  '/security': ['Security Center — Rabbit Chain','Verify official Rabbit domains, wallet safety, release integrity and public network surfaces.'],
  '/releases': ['Official Releases — Rabbit Chain','Rabbit Chain release center for verified binaries, versions, checksums and network compatibility.'],
  '/ecosystem': ['Rabbit Ecosystem','Explore official Rabbit network services, application modules, infrastructure and community participation.'],
  '/about': ['About Rabbit Chain','Rabbit Chain mission, design principles and public Testnet-first launch philosophy.'],
  '/testnet': ['Rabbit Testnet — Chain ID 9280','Enter Rabbit Testnet: wallet setup, Chain ID 9280, network endpoints, mining, nodes and developer resources.'],
  '/mainnet': ['Rabbit Mainnet — Chain ID 928','Rabbit Mainnet is the production Rabbit Chain network planned after public Testnet validation.'],
  '/lcq': ['LCQ Consensus — Rabbit Chain','Learn how LCQ coordinates work, eligibility, queue position, producer opportunities and committee participation.'],
  '/mining': ['Mining — Rabbit Chain','Official Rabbit mining path, release verification and LCQ participation guidance.'],
  '/nodes': ['Run a Node — Rabbit Chain','Operate an independent Rabbit node and participate in the permissionless P2P network.'],
  '/developers': ['Developers — Rabbit Chain','Rabbit Chain network parameters, EVM tooling and JSON-RPC developer resources.'],
  '/docs': ['Documentation — Rabbit Chain','Official Rabbit Chain technical documentation and network reference.'],
  '/platform': ['Rabbit Platform','The wallet-connected application layer for Rabbit Chain.'],
  '/whitepaper': ['Whitepaper — Rabbit Chain','Official Rabbit Chain protocol paper status and technical scope.'],
  '/community': ['Community — Rabbit Chain','Official Rabbit Chain community channels and public resources.'],
  '/status': ['Network Status — Rabbit Chain','Source of truth for Rabbit Testnet RPC, explorer, faucet and public network availability.'],
  '/privacy-policy': ['Privacy Policy — Rabbit Chain','Rabbit Chain privacy policy.'],
  '/terms-and-conditions': ['Terms & Conditions — Rabbit Chain','Rabbit Chain terms and conditions.'],
  '/risk-disclosure': ['Risk Disclosure — Rabbit Chain','Important Rabbit Chain network, software and digital-asset risk disclosures.']
}

function updateMeta(pathname){
  const [title,description]=META[pathname]||['Rabbit Chain','Rabbit Chain official network portal.']
  document.title=title
  const canonical=`https://rabbitchain.org${pathname==='/'?'':pathname}`
  const set=(selector,attr,value)=>{const el=document.querySelector(selector);if(el)el.setAttribute(attr,value)}
  set('meta[name="description"]','content',description)
  set('meta[property="og:title"]','content',title)
  set('meta[property="og:description"]','content',description)
  set('meta[property="og:url"]','content',canonical)
  set('meta[name="twitter:title"]','content',title)
  set('meta[name="twitter:description"]','content',description)
  set('link[rel="canonical"]','href',canonical)
}

function Page({children}){return <motion.div id="main-content" tabIndex={-1} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.26,ease:[.2,.7,.2,1]}}>{children}</motion.div>}

export default function App(){
  const location=useLocation()
  const [walletModalOpen,setWalletModalOpen]=useState(false)
  const [walletDrawerOpen,setWalletDrawerOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [provider,setProvider]=useState(null)
  const [walletName,setWalletName]=useState(null)
  const [walletKind,setWalletKind]=useState(null)
  const [walletState,setWalletState]=useState({account:null,chainId:null,chainIdHex:null})
  const [pendingNetwork,setPendingNetwork]=useState(null)
  const [toastMessage,setToastMessage]=useState('')

  function toast(message){setToastMessage(message);clearTimeout(toast._t);toast._t=setTimeout(()=>setToastMessage(''),3000)}
  const openWallet=()=>walletState.account?setWalletDrawerOpen(true):setWalletModalOpen(true)

  function applyWallet(wallet,state,{openDrawer=true}={}){
    setProvider(wallet.provider)
    setWalletName(wallet.name)
    setWalletKind(wallet.kind || 'injected')
    setWalletState(state)
    saveWalletPreference(wallet)
    setWalletModalOpen(false)
    if(openDrawer)setWalletDrawerOpen(true)
  }

  async function finishConnection(wallet,state){
    applyWallet(wallet,state)
    if(pendingNetwork){
      const target=pendingNetwork
      setPendingNetwork(null)
      try{
        await switchOrAddNetwork(wallet.provider,target)
        setWalletState(await getWalletSnapshot(wallet.provider))
        toast(`${target.name} added or switched in wallet`)
      }catch(e){toast(friendlyWalletError(e,'Network setup failed'))}
    }else toast(`${wallet.name} connected`)
  }

  async function selectWallet(wallet){
    try{
      const state=await connectWallet(wallet.provider)
      await finishConnection(wallet,state)
    }catch(e){toast(friendlyWalletError(e,'Wallet connection failed'))}
  }

  async function selectWalletConnect(){
    try{
      const wallet=await connectWalletConnect()
      const state=await getWalletSnapshot(wallet.provider)
      await finishConnection(wallet,state)
    }catch(e){toast(friendlyWalletError(e,'WalletConnect connection failed'))}
  }

  async function switchNetwork(network){
    if(!provider){
      setPendingNetwork(network)
      setWalletDrawerOpen(false)
      setWalletModalOpen(true)
      return
    }
    try{
      await switchOrAddNetwork(provider,network)
      setWalletState(await getWalletSnapshot(provider))
      toast(`${network.name} added or switched in wallet`)
    }catch(e){toast(friendlyWalletError(e,'Network setup failed'))}
  }

  function clearSession(message='Wallet disconnected from RabbitChain.org'){
    clearWalletPreference()
    setProvider(null)
    setWalletName(null)
    setWalletKind(null)
    setPendingNetwork(null)
    setWalletState({account:null,chainId:null,chainIdHex:null})
    setWalletDrawerOpen(false)
    if(message)toast(message)
  }

  async function disconnect(){
    try{
      if(walletKind==='walletconnect' && provider?.disconnect) await provider.disconnect()
      else await provider?.request?.({method:'wallet_revokePermissions',params:[{eth_accounts:{}}]})
    }catch{}
    clearSession()
  }

  useEffect(()=>{
    updateMeta(location.pathname)
    if(location.hash){
      const id=decodeURIComponent(location.hash.slice(1))
      requestAnimationFrame(()=>{
        const target=document.getElementById(id)
        if(target)target.scrollIntoView({behavior:'smooth',block:'start'})
      })
    }else window.scrollTo({top:0,behavior:'instant'})
  },[location.pathname,location.hash])

  useEffect(()=>{
    let cancelled=false
    ;(async()=>{
      const saved=getWalletPreference()
      if(!saved)return
      try{
        let wallet=null
        if(saved.kind==='walletconnect') wallet=await restoreWalletConnect()
        else {
          const wallets=await detectInjectedWallets(300)
          wallet=wallets.find((w)=>w.rdns===saved.rdns)||wallets.find((w)=>w.name===saved.name)
        }
        if(!wallet||cancelled)return
        const state=await getWalletSnapshot(wallet.provider)
        if(state.account)applyWallet(wallet,state,{openDrawer:false})
      }catch{}
    })()
    return()=>{cancelled=true}
  },[])

  useEffect(()=>{
    const onKey=(e)=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true)}
      if(e.key==='Escape'){setSearchOpen(false);setWalletModalOpen(false);setWalletDrawerOpen(false)}
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  },[])

  useEffect(()=>{
    const lock=walletModalOpen||walletDrawerOpen||searchOpen
    if(!lock)return
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    return()=>{document.body.style.overflow=previous}
  },[walletModalOpen,walletDrawerOpen,searchOpen])

  useEffect(()=>{
    if(!provider)return
    const onAccounts=(accounts)=>{if(!accounts?.[0])clearSession('Wallet session ended');else setWalletState((s)=>({...s,account:accounts[0]}))}
    const onChain=async()=>{try{setWalletState(await getWalletSnapshot(provider))}catch{}}
    const onDisconnect=()=>clearSession('Wallet session ended')
    provider.on?.('accountsChanged',onAccounts)
    provider.on?.('chainChanged',onChain)
    provider.on?.('disconnect',onDisconnect)
    return()=>{
      provider.removeListener?.('accountsChanged',onAccounts)
      provider.removeListener?.('chainChanged',onChain)
      provider.removeListener?.('disconnect',onDisconnect)
    }
  },[provider])

  return <div className="app-shell">
    <Header walletState={walletState} onWalletClick={openWallet} onOpenSearch={()=>setSearchOpen(true)}/>
    <Suspense fallback={<div className="rc7-route-loading"><span/><b>RABBIT CHAIN</b></div>}><AnimatePresence mode="wait"><Routes location={location} key={location.pathname}>
      <Route path="/" element={<Page><Home walletState={walletState} onConnect={openWallet} onAddNetwork={switchNetwork}/></Page>}/>
      <Route path="/network" element={<Page><NetworkOverview/></Page>}/>
      <Route path="/rab" element={<Page><Rab/></Page>}/>
      <Route path="/security" element={<Page><Security/></Page>}/>
      <Route path="/releases" element={<Page><Releases/></Page>}/>
      <Route path="/ecosystem" element={<Page><Ecosystem/></Page>}/>
      <Route path="/about" element={<Page><About/></Page>}/>
      <Route path="/testnet" element={<Page><Testnet walletState={walletState} onConnect={openWallet} onAddNetwork={switchNetwork}/></Page>}/>
      <Route path="/mainnet" element={<Page><Mainnet/></Page>}/>
      <Route path="/lcq" element={<Page><Lcq/></Page>}/>
      <Route path="/mining" element={<Page><Mining/></Page>}/>
      <Route path="/nodes" element={<Page><Nodes/></Page>}/>
      <Route path="/developers" element={<Page><Developers/></Page>}/>
      <Route path="/docs" element={<Page><Docs/></Page>}/>
      <Route path="/community" element={<Page><Community/></Page>}/>
      <Route path="/platform" element={<Page><Platform walletState={walletState} onConnect={openWallet}/></Page>}/>
      <Route path="/whitepaper" element={<Page><Whitepaper/></Page>}/>
      <Route path="/status" element={<Page><Status/></Page>}/>
      <Route path="/privacy-policy" element={<Page><PrivacyPolicy/></Page>}/>
      <Route path="/terms-and-conditions" element={<Page><TermsConditions/></Page>}/>
      <Route path="/risk-disclosure" element={<Page><RiskDisclosure/></Page>}/>
      <Route path="*" element={<Page><NotFound/></Page>}/>
    </Routes></AnimatePresence></Suspense>
    <Footer/>
    <WalletModal open={walletModalOpen} onClose={()=>{setWalletModalOpen(false);setPendingNetwork(null)}} onSelect={selectWallet} onWalletConnect={selectWalletConnect}/>
    <WalletDrawer open={walletDrawerOpen} state={walletState} walletName={walletName} onClose={()=>setWalletDrawerOpen(false)} onDisconnect={disconnect} onSwitch={switchNetwork} toast={toast}/>
    <SearchPalette open={searchOpen} onClose={()=>setSearchOpen(false)}/>
    {toastMessage&&<div className="toast" role="status" aria-live="polite">{toastMessage}</div>}
    <BackToTop/>
  </div>
}
