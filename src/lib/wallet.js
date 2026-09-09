import { NETWORK_LIST, WALLET_NETWORK_LIST } from '../config/networks'
import { REOWN_PROJECT_ID, WALLETCONNECT_METADATA } from '../config/walletconnect'

const LAST_WALLET_KEY = 'rabbit:last-wallet'
let walletConnectProviderPromise = null

// RABBIT_WALLETCONNECT_MOBILE_SESSION_V2
// Rabbit Testnet transactions stay required in the WalletConnect proposal,
// but session acceptance/restoration is delegated to EthereumProvider itself.
// One migration key is used only to discard the pre-V2 persisted session once.
const RABBIT_WC_TESTNET_CHAIN_ID = 9280
const RABBIT_WC_SESSION_MIGRATION_KEY = 'rabbit:walletconnect:interactive-v2'
const RABBIT_WC_BATCH_MIGRATION_KEY = 'rabbit:walletconnect:batch-v7'

async function migrateWalletConnectSessionOnce(provider) {
  if (typeof window === 'undefined') return

  let migrated = false
  try {
    migrated = window.localStorage.getItem(RABBIT_WC_SESSION_MIGRATION_KEY) === '1'
  } catch {}

  if (migrated) return

  // The old site could persist a WalletConnect session created while Rabbit
  // Testnet transaction capability was optional. Drop that session ONCE so the
  // next connection negotiates the current interactive proposal.
  if (provider?.session) {
    try { await provider.disconnect() } catch {}
  }

  try {
    window.localStorage.setItem(RABBIT_WC_SESSION_MIGRATION_KEY, '1')
  } catch {}
}

// RABBIT_WALLET_BATCH_CALLS_V7
// Existing sessions cannot gain newly requested optional methods in place.
// Clear the pre-V7 WalletConnect session once so the next connection can
// negotiate wallet_sendCalls. This is a one-time migration, not a reconnect loop.
async function migrateWalletConnectBatchSessionOnce(provider) {
  if (typeof window === 'undefined') return

  let migrated = false
  try {
    migrated = window.localStorage.getItem(RABBIT_WC_BATCH_MIGRATION_KEY) === '1'
  } catch {}

  if (migrated) return

  if (provider?.session) {
    try { await provider.disconnect() } catch {}
  }

  try {
    window.localStorage.setItem(RABBIT_WC_BATCH_MIGRATION_KEY, '1')
  } catch {}
}

// RABBIT_WALLETCONNECT_CHAIN_SYNC_V3
function isWalletConnectProvider(provider) {
  return Boolean(provider?.isWalletConnect || provider?.signer?.setDefaultChain || provider?.session)
}

function walletConnectSessionHasChain(provider, chainId) {
  const caip = `eip155:${Number(chainId)}`
  const namespaces = provider?.session?.namespaces || {}

  for (const [key, namespace] of Object.entries(namespaces)) {
    const namespaceKey = String(key)
    if (namespaceKey === caip) return true
    if (!namespaceKey.startsWith('eip155')) continue

    const chains = Array.isArray(namespace?.chains) ? namespace.chains : []
    const accounts = Array.isArray(namespace?.accounts) ? namespace.accounts : []

    if (chains.includes(caip)) return true
    if (accounts.some((account) => String(account).startsWith(`${caip}:`))) return true
  }

  return false
}

function setWalletConnectDefaultChain(provider, network) {
  if (!provider || !network) return
  if (!walletConnectSessionHasChain(provider, network.chainId)) {
    throw new Error(`${network.name} is not approved in this WalletConnect session. Disconnect and reconnect the wallet once.`)
  }

  const caip = `eip155:${Number(network.chainId)}`

  // @walletconnect/ethereum-provider routes request() through its internal
  // chainId, while UniversalProvider owns the CAIP-2 default chain.
  // Keep both in sync so reads and eth_sendTransaction go to the same chain.
  provider.signer?.setDefaultChain?.(caip, network.rpcUrl)

  try {
    provider.chainId = Number(network.chainId)
  } catch {}
}

function normalizeWalletConnectRabbitChain(provider) {
  if (!isWalletConnectProvider(provider)) return

  const current = Number(provider?.chainId)
  if (NETWORK_LIST.some((network) => Number(network.chainId) === current)) return

  const testnet = WALLET_NETWORK_LIST.find((network) => Number(network.chainId) === RABBIT_WC_TESTNET_CHAIN_ID)
  if (testnet && walletConnectSessionHasChain(provider, testnet.chainId)) {
    setWalletConnectDefaultChain(provider, testnet)
  }
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
        optionalMethods: ['wallet_switchEthereumChain','wallet_addEthereumChain','wallet_watchAsset','wallet_sendCalls','wallet_getCallsStatus','wallet_showCallsStatus','wallet_getCapabilities','eth_call','eth_getBalance','eth_getTransactionReceipt','personal_sign','eth_signTypedData'],
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

  // Do this only once after the V2 deployment. It clears the legacy
  // read-only/optional session without creating a permanent reconnect loop.
  await migrateWalletConnectSessionOnce(provider)
  await migrateWalletConnectBatchSessionOnce(provider)

  if (!provider.session) await provider.connect()
  normalizeWalletConnectRabbitChain(provider)

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
  await migrateWalletConnectBatchSessionOnce(provider)
  if (!provider.session) return null
  normalizeWalletConnectRabbitChain(provider)

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
  if (isWalletConnectProvider(provider)) {
    normalizeWalletConnectRabbitChain(provider)

    const accounts = await provider.request({ method: 'eth_accounts' })
    const internalChainId = Number(provider?.chainId)

    if (Number.isFinite(internalChainId) && internalChainId > 0) {
      return {
        account: accounts?.[0] || provider?.accounts?.[0] || null,
        chainIdHex: `0x${internalChainId.toString(16)}`,
        chainId: internalChainId
      }
    }
  }

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
  if (isWalletConnectProvider(provider)) {
    setWalletConnectDefaultChain(provider, network)
    return
  }

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
