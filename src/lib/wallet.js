import { NETWORK_LIST, WALLET_NETWORK_LIST } from '../config/networks'
import {
  disconnect as wagmiDisconnect,
  getAccount as wagmiGetAccount,
  switchChain as wagmiSwitchChain,
  watchAccount as wagmiWatchAccount,
} from 'wagmi/actions'
import {
  getRabbitAppKitNetwork,
  rabbitAppKit,
  rabbitWagmiAdapter,
  RABBIT_APPKIT_TESTNET,
} from './appkit'

const LAST_WALLET_KEY = 'rabbit:last-wallet'
const RABBIT_TESTNET_CHAIN_ID = 9280

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

function walletUnknownChain(error) {
  const code = Number(error?.code)
  const message = String(error?.message || '')
  return code === 4902 ||
    /unknown chain|unrecognized chain|chain.*not (?:added|found|configured)/i.test(message)
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

function rawProvider(provider) {
  return provider?.__rabbitRawProvider || provider
}

async function disconnectWagmiWallet() {
  const account = wagmiGetAccount(rabbitWagmiAdapter.wagmiConfig)
  if (!account?.connector) return
  await wagmiDisconnect(rabbitWagmiAdapter.wagmiConfig, {
    connector: account.connector,
  })
}

function wrapAppKitProvider(provider) {
  if (!provider?.request) throw new Error('Connected wallet did not expose an EVM provider.')

  const wrapped = {
    __rabbitAppKit: true,
    __rabbitRawProvider: provider,

    // RABBIT_APPKIT_WRITE_TIME_CHAIN_GUARD_V14B
    // Connect first. Only a Rabbit write may request Rabbit Testnet.
    request: async (args) => {
      const method = String(args?.method || '')
      if (method === 'eth_sendTransaction' || method === 'wallet_sendCalls') {
        await ensureAppKitRabbitTestnet(provider)
      }
      return provider.request(args)
    },

    disconnect: disconnectWagmiWallet,
  }

  if (typeof provider.on === 'function') {
    wrapped.on = provider.on.bind(provider)
  }
  if (typeof provider.removeListener === 'function') {
    wrapped.removeListener = provider.removeListener.bind(provider)
  }

  return wrapped
}

async function ensureRawProviderNetwork(provider, network) {
  const target = Number(network.chainId)

  let current = numericChainId(await provider.request({ method: 'eth_chainId' }))
  if (current === target) return

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }],
    })
  } catch (error) {
    if (!walletUnknownChain(error)) throw error

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [walletNetworkParams(network)],
    })

    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }],
    })
  }

  current = numericChainId(await provider.request({ method: 'eth_chainId' }))
  if (current !== target) {
    throw new Error(`${network.name} was not selected in the wallet.`)
  }
}

// RABBIT_APPKIT_WAGMI_STATE_FIX_V12
async function getWagmiProvider(account = wagmiGetAccount(rabbitWagmiAdapter.wagmiConfig)) {
  if (!account?.connector?.getProvider) return null
  return account.connector.getProvider()
}

// RABBIT_APPKIT_USER_CHOICE_V13
async function ensureAppKitRabbitTestnet(provider) {
  const raw = rawProvider(provider)
  const current = numericChainId(
    await raw.request({ method: 'eth_chainId' })
  )

  if (current === RABBIT_TESTNET_CHAIN_ID) return

  // AppKit/Wagmi owns chain switching for AppKit connections.
  // Do not manually call wallet_addEthereumChain through a WalletConnect session.
  try {
    await wagmiSwitchChain(rabbitWagmiAdapter.wagmiConfig, {
      chainId: RABBIT_TESTNET_CHAIN_ID,
    })
  } catch (error) {
    const detail = String(error?.shortMessage || error?.message || '')
    throw new Error(
      `Rabbit Testnet 9280 could not be activated in this wallet connection. ${detail}`.trim()
    )
  }

  const after = numericChainId(
    await raw.request({ method: 'eth_chainId' })
  )

  if (after !== RABBIT_TESTNET_CHAIN_ID) {
    throw new Error('Wallet connected, but Rabbit Testnet 9280 is not active.')
  }
}

function appKitWalletResult(provider, connector) {
  return {
    kind: 'walletconnect',
    name: connector?.name || 'EVM Wallet',
    icon: connector?.icon || null,
    provider: wrapAppKitProvider(provider),
    rdns: connector?.id || 'appkit',
  }
}

async function connectedWagmiWallet() {
  const account = wagmiGetAccount(rabbitWagmiAdapter.wagmiConfig)
  if (!account?.isConnected || !account?.address || !account?.connector) return null

  const provider = await getWagmiProvider(account)
  if (!provider?.request) return null

  // Restore the connection exactly as the wallet is.
  // Never force Rabbit 9280 merely because the page loaded.
  return appKitWalletResult(provider, account.connector)
}

async function waitForAppKitConnection() {
  // Explicit click on "All wallets" always means: let the user choose.
  // If AppKit auto-restored an older connector, disconnect it first instead
  // of silently selecting it and jumping straight to "Approve in wallet".
  const current = wagmiGetAccount(rabbitWagmiAdapter.wagmiConfig)
  if (current?.isConnected && current?.connector) {
    try {
      await wagmiDisconnect(rabbitWagmiAdapter.wagmiConfig, {
        connector: current.connector,
      })
    } catch {}
  }

  return new Promise((resolve, reject) => {
    let settled = false
    let modalSeenOpen = false
    let unwatchAccount = () => {}
    let unsubscribeState = () => {}

    const finish = (fn, value) => {
      if (settled) return
      settled = true
      try { unwatchAccount?.() } catch {}
      try { unsubscribeState?.() } catch {}
      fn(value)
    }

    unwatchAccount = wagmiWatchAccount(
      rabbitWagmiAdapter.wagmiConfig,
      {
        onChange: async (account) => {
          if (!account?.isConnected || !account?.address || !account?.connector) return

          try {
            const provider = await getWagmiProvider(account)
            if (!provider?.request) {
              throw new Error('Connected wallet did not expose an EVM provider.')
            }

            // Connection succeeds on the wallet's current chain.
            // Rabbit 9280 is requested only for a Rabbit write or explicit switch.
            finish(resolve, appKitWalletResult(provider, account.connector))
          } catch (error) {
            finish(reject, error)
          }
        },
      },
    )

    // subscribeState remains a supported AppKit API and is used only to
    // detect a user closing the modal before a connection completes.
    unsubscribeState = rabbitAppKit.subscribeState((state) => {
      if (state?.open) {
        modalSeenOpen = true
        return
      }

      if (!modalSeenOpen || settled) return

      const account = wagmiGetAccount(rabbitWagmiAdapter.wagmiConfig)
      if (!account?.isConnected) {
        const error = new Error('Wallet connection cancelled.')
        error.code = 4001
        finish(reject, error)
      }
    })

    Promise.resolve(
      rabbitAppKit.open({ view: 'Connect', namespace: 'eip155' })
    ).catch((error) => finish(reject, error))
  })
}

// RABBIT_APPKIT_EIP6963_V12
export function detectInjectedWallets(timeout = 650) {
  return new Promise((resolve) => {
    const found = new Map()

    const handler = (event) => {
      const detail = event?.detail
      if (!detail?.provider) return

      const key =
        detail.info?.uuid ||
        detail.info?.rdns ||
        detail.info?.name ||
        Math.random().toString(36)

      found.set(key, {
        kind: 'injected',
        name: detail.info?.name || 'Browser Wallet',
        icon: detail.info?.icon || null,
        provider: detail.provider,
        rdns: detail.info?.rdns || '',
      })
    }

    window.addEventListener('eip6963:announceProvider', handler)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', handler)

      if (
        window.ethereum &&
        ![...found.values()].some((wallet) => wallet.provider === window.ethereum)
      ) {
        found.set('legacy', {
          kind: 'injected',
          name: window.ethereum.isMetaMask ? 'MetaMask' : 'Browser Wallet',
          icon: null,
          provider: window.ethereum,
          rdns: 'legacy',
        })
      }

      resolve([...found.values()])
    }, timeout)
  })
}

// Public name preserved so App.jsx does not need invasive changes.
export async function connectWalletConnect() {
  return waitForAppKitConnection()
}

export async function restoreWalletConnect() {
  try {
    return await connectedWagmiWallet()
  } catch {
    return null
  }
}

export function saveWalletPreference(wallet) {
  try {
    localStorage.setItem(
      LAST_WALLET_KEY,
      JSON.stringify({
        kind: wallet.kind || 'injected',
        rdns: wallet.rdns || '',
        name: wallet.name || '',
      }),
    )
  } catch {}
}

export function getWalletPreference() {
  try {
    return JSON.parse(localStorage.getItem(LAST_WALLET_KEY) || 'null')
  } catch {
    return null
  }
}

export function clearWalletPreference() {
  try {
    localStorage.removeItem(LAST_WALLET_KEY)
  } catch {}
}

export async function connectWallet(provider) {
  const accounts = await provider.request({ method: 'eth_requestAccounts' })
  const chainIdHex = await provider.request({ method: 'eth_chainId' })

  return {
    account: accounts?.[0] || null,
    chainIdHex,
    chainId: numericChainId(chainIdHex),
  }
}

export async function getWalletSnapshot(provider) {
  const raw = rawProvider(provider)

  const [accounts, chainIdHex] = await Promise.all([
    raw.request({ method: 'eth_accounts' }),
    raw.request({ method: 'eth_chainId' }),
  ])

  return {
    account: accounts?.[0] || null,
    chainIdHex,
    chainId: numericChainId(chainIdHex),
  }
}

export async function switchOrAddNetwork(provider, network) {
  if (provider?.__rabbitAppKit) {
    const appKitNetwork = getRabbitAppKitNetwork(network.chainId)

    if (appKitNetwork) {
      try {
        await wagmiSwitchChain(rabbitWagmiAdapter.wagmiConfig, {
          chainId: Number(appKitNetwork.id),
        })
        return
      } catch {}
    }

    await ensureRawProviderNetwork(rawProvider(provider), network)
    return
  }

  await ensureRawProviderNetwork(provider, network)
}

export function friendlyWalletError(error, fallback = 'Wallet request failed') {
  if (error?.code === 4001) return 'Request cancelled in wallet.'
  if (error?.code === -32002) return 'A wallet request is already open.'

  const message = String(error?.message || '')

  if (/missing or invalid.*chainid|eip155:9280/i.test(message)) {
    return 'This wallet did not authorize Rabbit Testnet for this connection. Reconnect through All wallets / WalletConnect.'
  }

  if (/unsupported|not supported/i.test(message)) {
    return 'This wallet does not support that request yet.'
  }

  return message || fallback
}

export function identifyRabbitNetwork(chainId) {
  return NETWORK_LIST.find((network) => network.chainId === Number(chainId)) || null
}

export function shortAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
