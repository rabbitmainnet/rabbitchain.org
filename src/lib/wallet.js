import { NETWORK_LIST, WALLET_NETWORK_LIST } from '../config/networks'
import { REOWN_PROJECT_ID, WALLETCONNECT_METADATA } from '../config/walletconnect'

const LAST_WALLET_KEY = 'rabbit:last-wallet'
let walletConnectProviderPromise = null

// RABBIT_WALLETCONNECT_REQUIRED_TESTNET_V1
// A WalletConnect session must be able to WRITE on Rabbit Testnet.
// Previously Rabbit Testnet and eth_sendTransaction were optional, so a
// wallet could appear connected while approving only account/read access.
const RABBIT_WC_TESTNET_CHAIN_ID = 9280
const RABBIT_WC_TESTNET_CAIP = `eip155:${RABBIT_WC_TESTNET_CHAIN_ID}`

function walletConnectSessionSupportsRabbitTestnet(session) {
  if (!session) return false

  const namespaces = session?.namespaces || {}
  let chainApproved = false
  let sendApproved = false

  for (const [namespaceKey, namespace] of Object.entries(namespaces)) {
    if (!String(namespaceKey).startsWith('eip155')) continue

    const chains = Array.isArray(namespace?.chains) ? namespace.chains : []
    const accounts = Array.isArray(namespace?.accounts) ? namespace.accounts : []
    const methods = Array.isArray(namespace?.methods) ? namespace.methods : []

    const hasRabbitChain =
      namespaceKey === RABBIT_WC_TESTNET_CAIP ||
      chains.includes(RABBIT_WC_TESTNET_CAIP) ||
      accounts.some((account) => String(account).startsWith(`${RABBIT_WC_TESTNET_CAIP}:`))

    if (hasRabbitChain) chainApproved = true
    if (methods.includes('eth_sendTransaction')) sendApproved = true
  }

  return chainApproved && sendApproved
}

async function resetIncompatibleWalletConnectSession(provider) {
  if (!provider?.session || walletConnectSessionSupportsRabbitTestnet(provider.session)) return false

  try {
    await provider.disconnect()
  } catch {}

  return true
}

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
        // Rabbit Platform is interactive, so a successful WalletConnect session
        // must authorize Rabbit Testnet transactions instead of treating them as optional.
        chains: [RABBIT_WC_TESTNET_CHAIN_ID],
        methods: ['eth_sendTransaction'],
        events: ['chainChanged','accountsChanged'],
        optionalChains: WALLET_NETWORK_LIST
          .filter((n) => n.chainId !== RABBIT_WC_TESTNET_CHAIN_ID)
          .map((n) => n.chainId),
        optionalMethods: ['wallet_switchEthereumChain','wallet_addEthereumChain','wallet_watchAsset','eth_call','eth_getBalance','eth_getTransactionReceipt','personal_sign','eth_signTypedData'],
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

  // Sessions created before this fix may show the address but lack permission
  // to submit transactions. Drop those sessions and negotiate a proper one.
  await resetIncompatibleWalletConnectSession(provider)

  if (!provider.session) await provider.connect()

  if (!walletConnectSessionSupportsRabbitTestnet(provider.session)) {
    try { await provider.disconnect() } catch {}
    throw new Error('WalletConnect did not authorize Rabbit Testnet transactions. Reconnect with a wallet that supports Rabbit Testnet and transaction requests.')
  }

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

  // Never restore an old session that cannot sign/send on Rabbit Testnet.
  // The next Connect wallet action will create a fresh compatible session.
  if (!walletConnectSessionSupportsRabbitTestnet(provider.session)) {
    try { await provider.disconnect() } catch {}
    return null
  }

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
        nativeCurrency: { name: network.currencyName || network.currency, symbol: network.currency, decimals: 18 },
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

  const message = String(error?.message || '')
  if (/walletconnect/i.test(message) && /(namespace|chain|method|session|authorize|route)/i.test(message)) {
    return 'WalletConnect session cannot submit Rabbit Testnet transactions. Disconnect and reconnect the wallet, then try again.'
  }
  if (/unsupported|not supported/i.test(message)) return 'This wallet does not support that request yet.'
  return message || fallback
}

export function identifyRabbitNetwork(chainId) {
  return NETWORK_LIST.find((n) => n.chainId === chainId) || null
}

export function shortAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
