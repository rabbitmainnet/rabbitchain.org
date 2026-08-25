import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import WalletModal from './components/WalletModal'
import WalletDrawer from './components/WalletDrawer'
import SearchPalette from './components/SearchPalette'
import Home from './pages/Home'
import Testnet from './pages/Testnet'
import Mainnet from './pages/Mainnet'
import Lcq from './pages/Lcq'
import Mining from './pages/Mining'
import Nodes from './pages/Nodes'
import Developers from './pages/Developers'
import Docs from './pages/Docs'
import Community from './pages/Community'
import Platform from './pages/Platform'
import Whitepaper from './pages/Whitepaper'
import Status from './pages/Status'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import RiskDisclosure from './pages/RiskDisclosure'
import BackToTop from './components/BackToTop'
import { connectWallet, getWalletSnapshot, switchOrAddNetwork } from './lib/wallet'

const META = {
  '/':'Rabbit Chain — LCQ Layer 1',
  '/testnet':'Rabbit Testnet — Chain ID 9280',
  '/mainnet':'Rabbit Mainnet — Chain ID 928',
  '/lcq':'LCQ Consensus — Rabbit Chain',
  '/mining':'Mining — Rabbit Chain',
  '/nodes':'Run a Node — Rabbit Chain',
  '/developers':'Developers — Rabbit Chain',
  '/docs':'Documentation — Rabbit Chain',
  '/platform':'Rabbit Platform',
  '/whitepaper':'Whitepaper — Rabbit Chain',
  '/community':'Community — Rabbit Chain',
  '/status':'Network Status — Rabbit Chain',
  '/privacy-policy':'Privacy Policy — Rabbit Chain',
  '/terms-and-conditions':'Terms & Conditions — Rabbit Chain',
  '/risk-disclosure':'Risk Disclosure — Rabbit Chain'
}

function Page({children}){return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.26,ease:[.2,.7,.2,1]}}>{children}</motion.div>}

export default function App(){
  const location=useLocation()
  const [walletModalOpen,setWalletModalOpen]=useState(false)
  const [walletDrawerOpen,setWalletDrawerOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [provider,setProvider]=useState(null)
  const [walletName,setWalletName]=useState(null)
  const [walletState,setWalletState]=useState({account:null,chainId:null,chainIdHex:null})
  const [pendingNetwork,setPendingNetwork]=useState(null)
  const [toastMessage,setToastMessage]=useState('')

  function toast(message){setToastMessage(message);clearTimeout(toast._t);toast._t=setTimeout(()=>setToastMessage(''),2600)}
  const openWallet=()=>walletState.account?setWalletDrawerOpen(true):setWalletModalOpen(true)

  async function selectWallet(wallet){
    try{
      let state=await connectWallet(wallet.provider)
      setProvider(wallet.provider)
      setWalletName(wallet.name)
      setWalletState(state)
      setWalletModalOpen(false)

      if(pendingNetwork){
        const target=pendingNetwork
        setPendingNetwork(null)
        try{
          await switchOrAddNetwork(wallet.provider,target)
          state=await getWalletSnapshot(wallet.provider)
          setWalletState(state)
          toast(`${target.name} added to wallet`)
        }catch(e){
          toast(e?.message||'Network setup failed')
        }
      }else{
        toast(`${wallet.name} connected`)
      }
      setWalletDrawerOpen(true)
    }catch(e){
      toast(e?.message||'Wallet connection failed')
    }
  }

  async function switchNetwork(network){
    if(!network.publicRpcReady){
      toast(`${network.name} can be added when the official public RPC is live.`)
      return
    }
    if(!provider){
      setPendingNetwork(network)
      setWalletDrawerOpen(false)
      setWalletModalOpen(true)
      return
    }
    try{
      await switchOrAddNetwork(provider,network)
      setWalletState(await getWalletSnapshot(provider))
      toast(`${network.name} ready in wallet`)
    }catch(e){
      toast(e?.message||'Network setup failed')
    }
  }

  async function disconnect(){
    try{
      await provider?.request?.({method:'wallet_revokePermissions',params:[{eth_accounts:{}}]})
    }catch{
      // Some injected wallets do not implement permission revocation. Local site state is still cleared.
    }
    setProvider(null)
    setWalletName(null)
    setPendingNetwork(null)
    setWalletState({account:null,chainId:null,chainIdHex:null})
    setWalletDrawerOpen(false)
    toast('Wallet disconnected from RabbitChain.org')
  }

  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});document.title=META[location.pathname]||'Rabbit Chain'},[location.pathname])
  useEffect(()=>{const onKey=(e)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true)}if(e.key==='Escape'){setSearchOpen(false);setWalletModalOpen(false);setWalletDrawerOpen(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
  useEffect(()=>{if(!provider)return;const onAccounts=(accounts)=>{if(!accounts?.[0])disconnect();else setWalletState((s)=>({...s,account:accounts[0]}))};const onChain=async()=>setWalletState(await getWalletSnapshot(provider));provider.on?.('accountsChanged',onAccounts);provider.on?.('chainChanged',onChain);return()=>{provider.removeListener?.('accountsChanged',onAccounts);provider.removeListener?.('chainChanged',onChain)}},[provider])

  return <div className="app-shell">
    <Header walletState={walletState} onWalletClick={openWallet} onOpenSearch={()=>setSearchOpen(true)}/>
    <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}>
      <Route path="/" element={<Page><Home walletState={walletState} onConnect={openWallet} onAddNetwork={switchNetwork}/></Page>}/>
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
    </Routes></AnimatePresence>
    <Footer/>
    <WalletModal open={walletModalOpen} onClose={()=>{setWalletModalOpen(false);setPendingNetwork(null)}} onSelect={selectWallet}/>
    <WalletDrawer open={walletDrawerOpen} state={walletState} walletName={walletName} onClose={()=>setWalletDrawerOpen(false)} onDisconnect={disconnect} onSwitch={switchNetwork} toast={toast}/>
    <SearchPalette open={searchOpen} onClose={()=>setSearchOpen(false)}/>
    {toastMessage&&<div className="toast">{toastMessage}</div>}
    <BackToTop/>
  </div>
}
