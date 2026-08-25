export const NETWORKS = {
  testnet: {
    key: 'testnet',
    name: 'Rabbit Testnet',
    shortName: 'Testnet',
    chainId: 9280,
    chainIdHex: '0x2440',
    currency: 'RAB',
    consensus: 'LCQ',
    execution: 'EVM',
    role: 'First public launch',
    status: 'PRE-LAUNCH',
    statusTone: 'launch',
    description: 'The first public Rabbit network for mining, nodes, wallet integrations, applications and protocol validation before Mainnet.',
    rpcUrl: 'https://rpc.testnet.rabbitchain.org',
    wsUrl: 'wss://ws.testnet.rabbitchain.org',
    explorerUrl: 'https://explorer.testnet.rabbitchain.org',
    faucetUrl: 'https://faucet.testnet.rabbitchain.org',
    publicRpcReady: false,
    publicExplorerReady: false,
    publicFaucetReady: false
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
    status: 'AFTER TESTNET',
    statusTone: 'future',
    description: 'The production Rabbit Chain network that follows successful public Testnet validation and final launch gates.',
    rpcUrl: 'https://rpc.rabbitchain.org',
    wsUrl: 'wss://ws.rabbitchain.org',
    explorerUrl: 'https://explorer.rabbitchain.org',
    faucetUrl: null,
    publicRpcReady: false,
    publicExplorerReady: false,
    publicFaucetReady: false
  }
}

export const NETWORK_LIST = [NETWORKS.testnet, NETWORKS.mainnet]
