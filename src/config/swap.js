import { parseAbi } from 'viem'

export const RABBIT_SWAP_TESTNET = {
  chainId: 9280,
  status: 'TESTNET BETA',
  slippageBps: 50n,
  feeBps: 30n,
  protocolFeeBps: 5n,
  lpFeeBpsWhenProtocolOn: 25n,
  factory: '0x3455FF1c81B8FC1D8229019766495cD2a9A6C577',
  router: '0xF5A9BF9Df2c6CEb8987b2cb26f4CcE310577A7b0',
  wrappedNative: '0xef03F43eD1Cb21D56cB0b26934d09cabc1994c8d',
  referencePair: '0x8B9f4581b71964049acc6bE03b22000132438B385',
  tokens: {
    tRAB: {
      key: 'tRAB',
      symbol: 'tRAB',
      name: 'Test RAB',
      description: 'Rabbit Testnet native gas asset',
      decimals: 18,
      native: true,
      address: null,
      wrappedAddress: '0xef03F43eD1Cb21D56cB0b26934d09cabc1994c8d',
      logo: '/testnet-assets/trab.png',
    },
    tWRAB: {
      key: 'tWRAB',
      symbol: 'tWRAB',
      name: 'Wrapped Test RAB',
      description: '1:1 wrapped representation of tRAB',
      decimals: 18,
      native: false,
      address: '0xef03F43eD1Cb21D56cB0b26934d09cabc1994c8d',
      logo: '/testnet-assets/twrab.png',
    },
    tRUSD: {
      key: 'tRUSD',
      symbol: 'tRUSD',
      name: 'Testnet Rabbit USD',
      description: 'Testnet-only USD-denominated test asset',
      decimals: 6,
      native: false,
      address: '0xaB9fEC2ff2b4f481F585b2358f3842C66e0194bd',
      logo: '/testnet-assets/trusd.png',
    },
  },
}

export const RABBIT_SWAP_ROUTER_ABI = parseAbi([
  'function factory() view returns (address)',
  'function tWRAB() view returns (address)',
  'function pairFor(address tokenA,address tokenB) view returns (address pair)',
  'function getReserves(address tokenA,address tokenB) view returns (uint256 reserveA,uint256 reserveB)',
  'function getAmountsOut(uint256 amountIn,address[] path) view returns (uint256[] amounts)',
  'function swapExactRABForTokens(uint256 amountOutMin,address[] path,address to,uint256 deadline) payable returns (uint256[] amounts)',
  'function swapExactTokensForRAB(uint256 amountIn,uint256 amountOutMin,address[] path,address to,uint256 deadline) returns (uint256[] amounts)',
  'function swapExactTokensForTokens(uint256 amountIn,uint256 amountOutMin,address[] path,address to,uint256 deadline) returns (uint256[] amounts)',
  'function addLiquidity(address tokenA,address tokenB,uint256 amountADesired,uint256 amountBDesired,uint256 amountAMin,uint256 amountBMin,address to,uint256 deadline) returns (uint256 amountA,uint256 amountB,uint256 liquidity)',
  'function addLiquidityRAB(address token,uint256 amountTokenDesired,uint256 amountTokenMin,uint256 amountRABMin,address to,uint256 deadline) payable returns (uint256 amountToken,uint256 amountRAB,uint256 liquidity)',
  'function removeLiquidity(address tokenA,address tokenB,uint256 liquidity,uint256 amountAMin,uint256 amountBMin,address to,uint256 deadline) returns (uint256 amountA,uint256 amountB)',
  'function removeLiquidityRAB(address token,uint256 liquidity,uint256 amountTokenMin,uint256 amountRABMin,address to,uint256 deadline) returns (uint256 amountToken,uint256 amountRAB)',
])

export const RABBIT_SWAP_FACTORY_ABI = parseAbi([
  'function feeTo() view returns (address)',
  'function getPair(address tokenA,address tokenB) view returns (address pair)',
  'function allPairs(uint256) view returns (address pair)',
  'function allPairsLength() view returns (uint256)',
])

export const RABBIT_SWAP_ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner,address spender) view returns (uint256)',
  'function approve(address spender,uint256 amount) returns (bool)',
])

export const RABBIT_SWAP_PAIR_ABI = parseAbi([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner,address spender) view returns (uint256)',
  'function approve(address spender,uint256 amount) returns (bool)',
  'function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)',
])

export function canonicalSwapAddress(token) {
  return token?.native ? token.wrappedAddress : token?.address
}

export function getSwapToken(symbol) {
  return RABBIT_SWAP_TESTNET.tokens[symbol] || null
}

export function getSwapTokens() {
  return Object.values(RABBIT_SWAP_TESTNET.tokens)
}
