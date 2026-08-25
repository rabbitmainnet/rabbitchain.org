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
import { connectWallet, getWalletSnapshot, switchOrAddNetwork } from './lib/wallet'

function Page({children}){return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.26,ease:[.2,.7,.2,1]}}>{children}</motion.div>}

export default function App(){
  const location=useLocation()
  const [walletModalOpen,setWalletModalOpen]=useState(false)
  const [walletDrawerOpen,setWalletDrawerOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [provider,setProvider]=useState(null)
  const [walletName,setWalletName]=useState(null)
  const [walletState,setWalletState]=useState({account:null,chainId:null,chainIdHex:null})
  const [toastMessage,setToastMessage]=useState('')
  function toast(message){setToastMessage(message);clearTimeout(toast._t);toast._t=setTimeout(()=>setToastMessage(''),2400)}
  const openWallet=()=>walletState.account?setWalletDrawerOpen(true):setWalletModalOpen(true)
  async function selectWallet(wallet){try{const state=await connectWallet(wallet.provider);setProvider(wallet.provider);setWalletName(wallet.name);setWalletState(state);setWalletModalOpen(false);setWalletDrawerOpen(true);toast(`${wallet.name} connected`)}catch(e){toast(e?.message||'Wallet connection failed')}}
  async function switchNetwork(network){if(!provider){setWalletDrawerOpen(false);setWalletModalOpen(true);return}try{await switchOrAddNetwork(provider,network);setWalletState(await getWalletSnapshot(provider));toast(`Switched to ${network.name}`)}catch(e){toast(e?.message||'Network switch failed')}}
  function disconnect(){setProvider(null);setWalletName(null);setWalletState({account:null,chainId:null,chainIdHex:null});setWalletDrawerOpen(false);toast('Disconnected from this site')}
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[location.pathname])
  useEffect(()=>{const onKey=(e)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(true)}if(e.key==='Escape'){setSearchOpen(false);setWalletModalOpen(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
  useEffect(()=>{if(!provider)return;const onAccounts=(accounts)=>{if(!accounts?.[0])disconnect();else setWalletState((s)=>({...s,account:accounts[0]}))};const onChain=async()=>setWalletState(await getWalletSnapshot(provider));provider.on?.('accountsChanged',onAccounts);provider.on?.('chainChanged',onChain);return()=>{provider.removeListener?.('accountsChanged',onAccounts);provider.removeListener?.('chainChanged',onChain)}},[provider])
  return <div className="app-shell"><Header walletState={walletState} onWalletClick={openWallet} onOpenSearch={()=>setSearchOpen(true)}/><AnimatePresence mode="wait"><Routes location={location} key={location.pathname}><Route path="/" element={<Page><Home walletState={walletState} onConnect={openWallet}/></Page>}/><Route path="/testnet" element={<Page><Testnet walletState={walletState} onConnect={openWallet} onSwitch={switchNetwork}/></Page>}/><Route path="/mainnet" element={<Page><Mainnet/></Page>}/><Route path="/lcq" element={<Page><Lcq/></Page>}/><Route path="/mining" element={<Page><Mining/></Page>}/><Route path="/nodes" element={<Page><Nodes/></Page>}/><Route path="/developers" element={<Page><Developers/></Page>}/><Route path="/docs" element={<Page><Docs/></Page>}/><Route path="/community" element={<Page><Community/></Page>}/><Route path="*" element={<Page><Home walletState={walletState} onConnect={openWallet}/></Page>}/></Routes></AnimatePresence><Footer/><WalletModal open={walletModalOpen} onClose={()=>setWalletModalOpen(false)} onSelect={selectWallet}/><WalletDrawer open={walletDrawerOpen} state={walletState} walletName={walletName} onClose={()=>setWalletDrawerOpen(false)} onDisconnect={disconnect} onSwitch={switchNetwork} toast={toast}/><SearchPalette open={searchOpen} onClose={()=>setSearchOpen(false)}/>{toastMessage&&<div className="toast">{toastMessage}</div>}</div>
}
