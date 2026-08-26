import { NETWORK_LIST, WALLET_NETWORK_LIST } from '../config/networks'
import { REOWN_PROJECT_ID, WALLETCONNECT_METADATA } from '../config/walletconnect'

const LAST_WALLET_KEY = 'rabbit:last-wallet'
let walletConnectProviderPromise = null

export function detectInjectedWallets(timeout = 450) {
  return new Promise((resolve) => {
    const found = new Map()
    const handler = (event) => {
      const detail = event?.detail
      if (!detail?.provider) return
      const key = detail.info?.uuid || detail.info?.rdns || detail.info?.name || Math.random().toString(36)
      found.set(key, {
        kind: 'injected',
        name: detail.info?.name || 'Browser Wallet',
        icon: detail.info?.icon || null,
        provider: detail.provider,
        rdns: detail.info?.rdns || ''
      })
    }

    window.addEventListener('eip6963:announceProvider', handler)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', handler)
      if (window.ethereum && ![...found.values()].some((w) => w.provider === window.ethereum)) {
        found.set('legacy', {
          kind: 'injected',
          name: window.ethereum.isMetaMask ? 'MetaMask' : 'Browser Wallet',
          icon: null,
          provider: window.ethereum,
          rdns: 'legacy'
        })
      }
      resolve([...found.values()])
    }, timeout)
  })
}

async function getWalletConnectProvider() {
  if (!walletConnectProviderPromise) {
    walletConnectProviderPromise = import('@walletconnect/ethereum-provider').then(async ({ EthereumProvider }) => {
      const rpcMap = Object.fromEntries(WALLET_NETWORK_LIST.filter((n) => n.rpcUrl).map((n) => [n.chainId, n.rpcUrl]))
      return EthereumProvider.init({
        projectId: REOWN_PROJECT_ID,
        metadata: WALLETCONNECT_METADATA,
        showQrModal: true,
        optionalChains: WALLET_NETWORK_LIST.map((n) => n.chainId),
        optionalMethods: ['wallet_switchEthereumChain','wallet_addEthereumChain','eth_sendTransaction','personal_sign','eth_signTypedData'],
        optionalEvents: ['chainChanged','accountsChanged'],
        rpcMap,
        qrModalOptions: { themeMode: 'light' }
      })
    })
  }
  return walletConnectProviderPromise
}

export async function connectWalletConnect() {
  const provider = await getWalletConnectProvider()
  if (!provider.session) await provider.connect()
  const peer = provider.session?.peer?.metadata
  return {
    kind: 'walletconnect',
    name: peer?.name || 'WalletConnect',
    icon: peer?.icons?.[0] || null,
    provider,
    rdns: 'walletconnect'
  }
}

export async function restoreWalletConnect() {
  const provider = await getWalletConnectProvider()
  if (!provider.session) return null
  const peer = provider.session?.peer?.metadata
  return {
    kind: 'walletconnect',
    name: peer?.name || 'WalletConnect',
    icon: peer?.icons?.[0] || null,
    provider,
    rdns: 'walletconnect'
  }
}

export function saveWalletPreference(wallet) {
  try {
    localStorage.setItem(LAST_WALLET_KEY, JSON.stringify({ kind: wallet.kind || 'injected', rdns: wallet.rdns || '', name: wallet.name || '' }))
  } catch {}
}

export function getWalletPreference() {
  try { return JSON.parse(localStorage.getItem(LAST_WALLET_KEY) || 'null') } catch { return null }
}

export function clearWalletPreference() {
  try { localStorage.removeItem(LAST_WALLET_KEY) } catch {}
}

export async function connectWallet(provider) {
  const accounts = await provider.request({ method: 'eth_requestAccounts' })
  const chainIdHex = await provider.request({ method: 'eth_chainId' })
  return {
    account: accounts?.[0] || null,
    chainIdHex,
    chainId: Number.parseInt(chainIdHex, 16)
  }
}

export async function getWalletSnapshot(provider) {
  const [accounts, chainIdHex] = await Promise.all([
    provider.request({ method: 'eth_accounts' }),
    provider.request({ method: 'eth_chainId' })
  ])
  return {
    account: accounts?.[0] || null,
    chainIdHex,
    chainId: Number.parseInt(chainIdHex, 16)
  }
}

export async function switchOrAddNetwork(provider, network) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }]
    })
  } catch (error) {
    if (error?.code !== 4902) throw error
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: network.chainIdHex,
        chainName: network.name,
        nativeCurrency: { name: network.currency, symbol: network.currency, decimals: 18 },
        rpcUrls: [network.rpcUrl],
        blockExplorerUrls: network.explorerUrl ? [network.explorerUrl] : [],
        iconUrls: ['https://rabbitchain.org/rabbit-wallet-icon.png']
      }]
    })
  }
}

export function friendlyWalletError(error, fallback = 'Wallet request failed') {
  if (error?.code === 4001) return 'Request cancelled in wallet.'
  if (error?.code === -32002) return 'A wallet request is already open.'
  if (/unsupported|not supported/i.test(error?.message || '')) return 'This wallet does not support that request yet.'
  return error?.message || fallback
}

export function identifyRabbitNetwork(chainId) {
  return NETWORK_LIST.find((n) => n.chainId === chainId) || null
}

export function shortAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
