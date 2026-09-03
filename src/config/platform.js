import { NETWORKS } from './networks'
import { getSwapTokens } from './swap'

export const PLATFORM_DEFAULT_NETWORK = 'testnet'

const TOKENS = {
  testnet: getSwapTokens(),

  mainnet: [
    {
      symbol: 'RAB',
      name: 'Rabbit',
      description: 'Rabbit Mainnet native asset',
      decimals: 18,
      native: true,
      address: null,
      logo: '/rabbit-mark.png',
      faucet: false,
    },
  ],
}

function networkStatus(network) {
  if (network.networkLive) return 'LIVE'
  return network.key === 'mainnet' ? 'COMING LATER' : 'PRE-LAUNCH'
}

export const PLATFORM_NETWORKS = Object.fromEntries(
  Object.entries(NETWORKS).map(([key, network]) => [
    key,
    {
      key,
      label: network.shortName.toUpperCase(),
      name: network.name,
      chainId: String(network.chainId),
      networkLive: network.networkLive,
      walletEnabled: network.walletEnabled,
      status: networkStatus(network),
      showFaucet: Boolean(network.faucetUrl),
      faucetLive: network.publicFaucetReady,
      swapLive: network.platform.swapLive,
      modules: network.platform,
      defaultFrom: network.currency,
      defaultTo: key === 'testnet' ? 'tRUSD' : null,
      tokens: TOKENS[key],
    },
  ])
)

export function platformModuleLive(networkKey, tool) {
  const network = PLATFORM_NETWORKS[networkKey]
  if (!network) return false
  if (tool === 'faucet') return network.showFaucet && network.faucetLive
  return Boolean(network.modules?.[`${tool}Live`])
}

export function platformModuleStatus(networkKey, tool) {
  const network = PLATFORM_NETWORKS[networkKey]
  if (!network) return 'UNAVAILABLE'
  if (networkKey === 'testnet' && platformModuleLive(networkKey, tool) && (tool === 'swap' || tool === 'liquidity' || tool === 'factory')) return 'TESTNET BETA'
  if (platformModuleLive(networkKey, tool)) return 'LIVE'
  if (networkKey === 'mainnet' && !network.networkLive) return 'COMING LATER'
  return 'PRE-LAUNCH'
}
