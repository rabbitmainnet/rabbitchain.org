import { parseAbi } from 'viem'

export const RABBIT_TOKEN_FACTORY_TESTNET = {
  chainId: 9280,
  status: 'TESTNET BETA',
  factory: '0x7edF729000e7fE79bf5De16B23f28b997dd5cD31',
  oracle: '0xfF8be2D94Fc5C918C4b238d8a14a0398eFAC81F1',
  treasury: '0x1fe3CcD380Bf7D012F172a5e9187c88968597a85',
  tRUSD: '0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd',
  tWRAB: '0xef03F43eD1Cb21D56cB0b26934d09cabc1994c8d',
  feeTRUSD: 100000000n,
  feeTRUSDDecimals: 6,
  supportedDecimals: [6, 8, 9, 18],
}

export const RABBIT_TOKEN_FACTORY_ABI = parseAbi([
  'function CREATION_FEE_TRUSD() view returns (uint256)',
  'function RABBIT_TESTNET_CHAIN_ID() view returns (uint256)',
  'function oracle() view returns (address)',
  'function treasury() view returns (address)',
  'function tRUSD() view returns (address)',
  'function tWRAB() view returns (address)',
  'function getCreationFeeStatus() view returns (uint256 trusdFee,uint256 rabFee,bool oracleFresh)',
  'function quoteCreationFeeRAB() view returns (uint256)',
  'function refreshOracle() returns (bool updated,bool fresh)',
  'function totalTokens() view returns (uint256)',
  'function creatorTokenCount(address creator) view returns (uint256)',
  'function getCreatorTokensPaginated(address creator,uint256 start,uint256 limit) view returns (address[])',
  'function isFactoryToken(address token) view returns (bool)',
  'function createTokenWithTRUSD(string name,string symbol,uint8 decimals,uint256 supply) returns (address tokenAddress)',
  'function createTokenWithRAB(string name,string symbol,uint8 decimals,uint256 supply) payable returns (address tokenAddress)',
])
