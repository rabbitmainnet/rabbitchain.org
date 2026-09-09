import { NETWORK_LIST, WALLET_NETWORK_LIST } from '../config/networks'
import { REOWN_PROJECT_ID, WALLETCONNECT_METADATA } from '../config/walletconnect'

const LAST_WALLET_KEY = 'rabbit:last-wallet'
let walletConnectProviderPromise = null

// RABBIT_WALLETCONNECT_SESSION_MODAL_GUARD_V17
// Keep the WalletConnect/AppKit connect modal available while pairing.
// The instant a real WalletConnect session exists, the connect modal is stale
// and must never remain visible or reopen.
function installWalletConnectSessionModalGuard(provider) {
  if (!provider || provider.__rabbitSessionModalGuardV17) return
  provider.__rabbitSessionModalGuardV17 = true

  const closeIfSessionExists = () => {
    if (!provider.session) return

    try {
      const result = provider.modal?.close?.()
      if (result && typeof result.catch === 'function') result.catch(() => {})
    } catch {}
  }

  // EthereumProvider emits "connect" after the session is created.
  provider.on?.('connect', closeIfSessionExists)

  // Some mobile/QR flows can re-open or leave the AppKit modal visible after
  // the connect event. Close every such stale presentation while the session lives.
  try {
    provider.modal?.subscribeState?.((state) => {
      if (!state?.open || !provider.session) return
      queueMicrotask(closeIfSessionExists)
    })
  } catch {}

  // Also cover providers that finish modal state updates one tick later.
  const closeAfterConnect = () => {
    closeIfSessionExists()
    setTimeout(closeIfSessionExists, 0)
    setTimeout(closeIfSessionExists, 100)
    setTimeout(closeIfSessionExists, 350)
  }

  provider.on?.('connect', closeAfterConnect)
}

let walletConnectBootstrapProviderPromise = null

// RABBIT_WALLETCONNECT_MOBILE_SESSION_V2
// Rabbit Testnet transactions stay required in the WalletConnect proposal,
// but session acceptance/restoration is delegated to EthereumProvider itself.
// One migration key is used only to discard the pre-V2 persisted session once.
const RABBIT_WC_TESTNET_CHAIN_ID = 9280
const RABBIT_WC_SESSION_MIGRATION_KEY = 'rabbit:walletconnect:interactive-v2'
const RABBIT_WC_BATCH_MIGRATION_KEY = 'rabbit:walletconnect:batch-v7'
const RABBIT_WC_OPTIONAL_CHAIN_MIGRATION_KEY = 'rabbit:walletconnect:optional-chain-v10'
const RABBIT_WC_SINGLE_PAIR_MIGRATION_KEY = 'rabbit:walletconnect:single-pair-v11'

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


// RABBIT_WALLETCONNECT_OPTIONAL_CHAIN_V10
// WalletConnect custom chains must be part of the optional namespace for
// wallets such as Rabby to route later requests to eip155:9280 correctly.
async function migrateWalletConnectOptionalChainOnce(provider) {
  if (typeof window === 'undefined') return

  let migrated = false
  try {
    migrated = window.localStorage.getItem(RABBIT_WC_OPTIONAL_CHAIN_MIGRATION_KEY) === '1'
  } catch {}

  if (migrated) return

  // A WalletConnect session cannot retroactively gain a chain namespace.
  // Drop the pre-V10 session once so the next pairing negotiates 9280 again.
  if (provider?.session) {
    try { await provider.disconnect() } catch {}
  }

  try {
    window.localStorage.setItem(RABBIT_WC_OPTIONAL_CHAIN_MIGRATION_KEY, '1')
  } catch {}
}

function walletConnectRequestedChains() {
  const ids = WALLET_NETWORK_LIST
    .map((network) => Number(network.chainId))
    .filter((chainId) => Number.isFinite(chainId) && chainId > 0 && chainId !== RABBIT_WC_TESTNET_CHAIN_ID)

  return [RABBIT_WC_TESTNET_CHAIN_ID, ...ids]
}


// RABBIT_WALLETCONNECT_SINGLE_PAIR_V11
// V10 could automatically create a second pairing if the wallet omitted
// Rabbit Testnet from the optional namespace. V11 never does that.
async function migrateWalletConnectSinglePairOnce(provider) {
  if (typeof window === 'undefined') return

  let migrated = false
  try {
    migrated = window.localStorage.getItem(RABBIT_WC_SINGLE_PAIR_MIGRATION_KEY) === '1'
  } catch {}

  if (migrated) return

  // Clear any V10 session once. The next user-initiated connect produces
  // exactly one fresh QR/pairing.
  if (provider?.session) {
    try { await provider.disconnect() } catch {}
  }

  try {
    window.localStorage.setItem(RABBIT_WC_SINGLE_PAIR_MIGRATION_KEY, '1')
  } catch {}
}

async function waitForWalletConnectRabbitApproval(provider, timeoutMs = 1800) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (walletConnectSessionHasChain(provider, RABBIT_WC_TESTNET_CHAIN_ID)) return true
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  return walletConnectSessionHasChain(provider, RABBIT_WC_TESTNET_CHAIN_ID)
}

async function tryPrepareRabbitInsideWalletConnectSession(provider, network) {
  if (!provider?.session || !network) return false

  // wallet_* methods are chain-management requests. Try them in the already
  // approved session; never disconnect/re-pair automatically.
  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [walletNetworkParams(network)]
    })
  } catch (error) {
    if (!walletConnectChainAlreadyAdded(error) && !walletMethodUnsupported(error)) {
      // User rejection or a wallet-specific failure should not trigger
      // another QR. Continue to the final namespace check below.
    }
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }]
    })
  } catch {}

  return waitForWalletConnectRabbitApproval(provider)
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

function walletConnectSessionSupportsMethod(provider, method) {
  const namespaces = provider?.session?.namespaces || {}
  return Object.values(namespaces).some((namespace) => {
    const methods = Array.isArray(namespace?.methods) ? namespace.methods : []
    return methods.includes(method)
  })
}

// RABBIT_WALLETCONNECT_CUSTOM_CHAIN_BOOTSTRAP_V9
// Keep the existing strict Rabbit Testnet session as the primary path.
// Only wallets that explicitly reject the custom chain during pairing use
// the compatibility bootstrap below.
function walletConnectNeedsCustomChainBootstrap(error) {
  const message = String(error?.message || error || '')

  // Never turn a user cancellation into another wallet prompt.
  if (/user rejected|user denied|declined|cancelled|canceled|request reset|connection request reset/i.test(message)) {
    return false
  }

  return /requested chains?.*(?:not supported|unsupported)|chains?.*(?:not supported|unsupported)|unsupported.*chains?|non.?conforming.*namespace|namespace.*(?:chain|unsupported)/i.test(message)
}

function walletConnectChainAlreadyAdded(error) {
  const message = String(error?.message || error || '')
  return /already.*(?:added|exists|configured)|chain.*already/i.test(message)
}

function walletNetworkParams(network) {
  return {
    chainId: network.chainIdHex,
    chainName: network.name,
    nativeCurrency: {
      name: network.currencyName || network.currency,
      symbol: network.currency,
      decimals: 18,
    },
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: network.explorerUrl ? [network.explorerUrl] : [],
    iconUrls: ['https://rabbitchain.org/rabbit-wallet-icon.png'],
  }
}

function numericChainId(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  const input = String(value || '').trim()
  if (!input) return null
  const parsed = input.startsWith('0x') || input.startsWith('0X')
    ? Number.parseInt(input, 16)
    : Number.parseInt(input, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function walletMethodUnsupported(error) {
  const code = Number(error?.code)
  const message = String(error?.message || '')
  return code === -32601 || code === 4200 || /unsupported|not supported|method not found|unknown method/i.test(message)
}

function walletUnknownChain(error) {
  const code = Number(error?.code)
  const message = String(error?.message || '')
  return code === 4902 || /unknown chain|unrecognized chain|chain.*not (?:added|found|configured)/i.test(message)
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
        // V10: propose Rabbit Testnet in the optional WalletConnect namespace.
        // This keeps the QR/mobile handshake compatible with wallets that accept
        // custom EVM chains only through optionalNamespaces.
        optionalChains: walletConnectRequestedChains(),
        optionalMethods: ['eth_sendTransaction','wallet_switchEthereumChain','wallet_addEthereumChain','wallet_watchAsset','wallet_sendCalls','wallet_getCallsStatus','wallet_showCallsStatus','wallet_getCapabilities','eth_call','eth_getBalance','eth_getTransactionReceipt','personal_sign','eth_signTypedData'],
        optionalEvents: ['chainChanged','accountsChanged'],
        rpcMap,
        qrModalOptions: { themeMode: 'light' }
      })
    })
  }
  return walletConnectProviderPromise
}

async function getWalletConnectBootstrapProvider() {
  if (!walletConnectBootstrapProviderPromise) {
    walletConnectBootstrapProviderPromise = import('@walletconnect/ethereum-provider').then(async ({ EthereumProvider }) => {
      return EthereumProvider.init({
        projectId: REOWN_PROJECT_ID,
        metadata: WALLETCONNECT_METADATA,
        showQrModal: true,

        // Compatibility session only. Ethereum mainnet is used as a widely
        // supported EVM transport so the wallet can receive EIP-3085.
        // No Rabbit transaction is ever sent on this bootstrap session.
        chains: [1],
        methods: ['wallet_addEthereumChain'],
        events: ['chainChanged','accountsChanged'],
        optionalMethods: ['wallet_switchEthereumChain'],
        optionalEvents: ['chainChanged','accountsChanged'],
        qrModalOptions: { themeMode: 'light' }
      })
    })
  }
  return walletConnectBootstrapProviderPromise
}

async function bootstrapRabbitTestnetViaWalletConnect() {
  const network = WALLET_NETWORK_LIST.find((item) => Number(item.chainId) === RABBIT_WC_TESTNET_CHAIN_ID)
  if (!network) throw new Error('Rabbit Testnet configuration is unavailable.')

  const bootstrap = await getWalletConnectBootstrapProvider()

  // A bootstrap session is disposable. Never let it replace the real Rabbit
  // session used by the application.
  if (bootstrap.session) {
    try { await bootstrap.disconnect() } catch {}
  }

  try {
    await bootstrap.connect()

    try {
      await bootstrap.request({
        method: 'wallet_addEthereumChain',
        params: [walletNetworkParams(network)]
      })
    } catch (error) {
      if (!walletConnectChainAlreadyAdded(error)) throw error
    }

    // Helpful when supported, but not required: the following strict Rabbit
    // reconnect remains the authoritative chain/session gate.
    if (walletConnectSessionSupportsMethod(bootstrap, 'wallet_switchEthereumChain')) {
      try {
        await bootstrap.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainIdHex }]
        })
      } catch {}
    }
  } catch (error) {
    const message = String(error?.message || error || '')
    throw new Error(
      `This wallet cannot add Rabbit Testnet through WalletConnect automatically. ` +
      `Open RabbitChain.org in the wallet browser once and connect there, then try WalletConnect again.` +
      (message ? ` (${message})` : '')
    )
  } finally {
    if (bootstrap.session) {
      try { await bootstrap.disconnect() } catch {}
    }
  }
}

export async function connectWalletConnect() {
  const provider = await getWalletConnectProvider()
  installWalletConnectSessionModalGuard(provider)

  await migrateWalletConnectSessionOnce(provider)
  await migrateWalletConnectBatchSessionOnce(provider)
  await migrateWalletConnectOptionalChainOnce(provider)
  await migrateWalletConnectSinglePairOnce(provider)

  // The init configuration already contains Rabbit Testnet in optionalChains.
  // One explicit user action = one WalletConnect pairing/QR.
  if (!provider.session) {
    await provider.connect()
  }

  const testnet = WALLET_NETWORK_LIST.find(
    (network) => Number(network.chainId) === RABBIT_WC_TESTNET_CHAIN_ID
  )
  if (!testnet) throw new Error('Rabbit Testnet configuration is unavailable.')

  let rabbitApproved = walletConnectSessionHasChain(provider, RABBIT_WC_TESTNET_CHAIN_ID)

  if (!rabbitApproved) {
    rabbitApproved = await tryPrepareRabbitInsideWalletConnectSession(provider, testnet)
  }

  if (!rabbitApproved) {
    const peerName = String(provider.session?.peer?.metadata?.name || 'This wallet')
    throw new Error(
      `${peerName} connected, but did not authorize Rabbit Testnet (eip155:9280) in this WalletConnect session. ` +
      `No second QR was opened. If this is Rabby, open RabbitChain.org inside Rabby's built-in browser; ` +
      `Rabby currently has a custom-chain WalletConnect namespace limitation.`
    )
  }

  if (!walletConnectSessionSupportsMethod(provider, 'eth_sendTransaction')) {
    throw new Error(
      'Wallet connected to Rabbit Testnet but did not authorize transaction signing in this WalletConnect session.'
    )
  }

  setWalletConnectDefaultChain(provider, testnet)

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
  installWalletConnectSessionModalGuard(provider)
  await migrateWalletConnectBatchSessionOnce(provider)
  await migrateWalletConnectOptionalChainOnce(provider)
  await migrateWalletConnectSinglePairOnce(provider)

  if (!provider.session) return null
  try { await provider.modal?.close?.() } catch {}

  if (
    !walletConnectSessionHasChain(provider, RABBIT_WC_TESTNET_CHAIN_ID) ||
    !walletConnectSessionSupportsMethod(provider, 'eth_sendTransaction')
  ) {
    return null
  }

  const testnet = WALLET_NETWORK_LIST.find(
    (network) => Number(network.chainId) === RABBIT_WC_TESTNET_CHAIN_ID
  )
  if (!testnet) return null

  setWalletConnectDefaultChain(provider, testnet)

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
