export const TESTNET_LIVE = true
export const MAINNET_LIVE = false

export const NETWORKS = {
  testnet: {
    key: 'testnet',
    name: 'Rabbit Testnet',
    shortName: 'Testnet',
    chainId: 9280,
    chainIdHex: '0x2440',
    currency: 'tRAB',
    currencyName: 'Test RAB',
    consensus: 'LCQ',
    execution: 'EVM',
    role: 'First public launch',
    status: TESTNET_LIVE ? 'LIVE' : 'PRE-LAUNCH',
    statusTone: 'live',
    description: 'The first public Rabbit network for mining, nodes, wallet integrations, applications and protocol validation before Mainnet.',
    rpcUrl: 'https://rpc-testnet.rabbitchain.org',
    wsUrl: 'wss://rpc-testnet.rabbitchain.org/ws',
    explorerUrl: 'https://explorer-testnet.rabbitchain.org',
    faucetUrl: 'https://rabbitchain.org/platform/faucet',

    // Launch/readiness source of truth.
    networkLive: TESTNET_LIVE,
    walletEnabled: true,
    publicRpcReady: true,
    publicWsReady: true,
    publicExplorerReady: true,
    publicFaucetReady: true,

    platform: {
      swapLive: true,
      liquidityLive: true,
      stakingLive: false,
      bridgeLive: false,
      p2pLive: false,
      launchpoolLive: false,
      factoryLive: false,
    },
  },

  mainnet: {
    key: 'mainnet',
    name: 'Rabbit Mainnet',
    shortName: 'Mainnet',
    chainId: 928,
    chainIdHex: '0x3a0',
    currency: 'RAB',
    consensus: 'LCQ',
    execution: 'EVM',
    role: 'Production network',
    status: MAINNET_LIVE ? 'LIVE' : 'AFTER TESTNET',
    statusTone: 'future',
    description: 'The production Rabbit Chain network that follows successful public Testnet validation and final launch gates.',
    rpcUrl: 'https://rpc.rabbitchain.org',
    wsUrl: 'wss://ws.rabbitchain.org',
    explorerUrl: 'https://explorer.rabbitchain.org',
    faucetUrl: null,

    // Mainnet remains unavailable until its own launch gate is complete.
    networkLive: MAINNET_LIVE,
    walletEnabled: MAINNET_LIVE,
    publicRpcReady: false,
    publicWsReady: false,
    publicExplorerReady: false,
    publicFaucetReady: false,

    platform: {
      swapLive: false,
      liquidityLive: false,
      stakingLive: false,
      bridgeLive: false,
      p2pLive: false,
      launchpoolLive: false,
      factoryLive: false,
    },
  },
}

export const NETWORK_LIST = [NETWORKS.testnet, NETWORKS.mainnet]
export const WALLET_NETWORK_LIST = NETWORK_LIST.filter((network) => network.walletEnabled)
