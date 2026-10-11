import ABIS from './launchpool-abi.json'

// V3 stays disabled until a verified contract address is explicitly configured.
const candidate = import.meta.env.VITE_RABBIT_LAUNCHPOOL_V3_MARKET || ''
const v3Market = /^0x[a-fA-F0-9]{40}$/.test(candidate) ? candidate : ''
const legacyMarket = '0x01652E93a0Fa71A13947dba4fd9C5cDAd900E01D'

export const RABBIT_LAUNCHPOOL_TESTNET = Object.freeze({
  chainId: 9280,
  rpc: 'https://rpc-testnet.rabbitchain.org',
  explorer: 'https://explorer-testnet.rabbitchain.org',
  registry: '0xbeb87F35E8c7160a8F9849485561462C3ff99227',
  lpLock: '0x60E3918a6727E42f7ea45d409438Fd46A7B58F1b',
  market: v3Market || legacyMarket,
  v3Market,
  legacyMarket,
  feeVault: '0x1ce87230C8C74CdE68485B3e0028Ab4B25d2000A',
  tRUSD: '0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd',
  router: '0xF5A9BF9Df2c6CEb8987b2cb26f4CcE310577A7b0',
  swapFactory: '0x3455FF1c81B8FC1D8229019766495cD2a9A6C577',
  treasury: '0x6CfCE6e48085F1B463D90d9Dcad1DFA6F732fF35',
})

export const RABBIT_LAUNCHPOOL_ABI = {
  ...ABIS,
  market: [
    ...ABIS.market,
    {
      type: 'function',
      name: 'launchSimple',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'token', type: 'address' },
        { name: 'paymentAsset', type: 'address' },
        { name: 'totalAmount', type: 'uint256' },
        { name: 'basePrice', type: 'uint256' },
        { name: 'slope', type: 'uint256' }
      ],
      outputs: [{ name: 'marketId', type: 'uint256' }]
    }
  ]
}
