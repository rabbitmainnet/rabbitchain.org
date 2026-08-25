export const NETWORKS = {
  mainnet: {
    key: 'mainnet',
    name: 'Rabbit Mainnet',
    shortName: 'Mainnet',
    chainId: 928,
    chainIdHex: '0x3a0',
    currency: 'RAB',
    consensus: 'LCQ',
    execution: 'EVM',
    rpcUrl: 'https://rpc.rabbitchain.org',
    explorerUrl: 'https://explorer.rabbitchain.org',
    faucetUrl: null,
    publicRpcReady: false,
    status: 'COMING SOON'
  },
  testnet: {
    key: 'testnet',
    name: 'Rabbit Testnet',
    shortName: 'Testnet',
    chainId: 9280,
    chainIdHex: '0x2440',
    currency: 'RAB',
    consensus: 'LCQ',
    execution: 'EVM',
    rpcUrl: 'https://rpc.testnet.rabbitchain.org',
    explorerUrl: 'https://explorer.testnet.rabbitchain.org',
    faucetUrl: 'https://faucet.testnet.rabbitchain.org',
    publicRpcReady: false,
    status: 'PRE-LAUNCH'
  }
}

export const NETWORK_LIST = [NETWORKS.mainnet, NETWORKS.testnet]
