import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseAbi,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
  stringToHex,
} from 'viem'

const RPC = 'https://rpc-testnet.rabbitchain.org'

export const RABBIT_FX = Object.freeze({
  chainId: 9280,
  oracle: '0xFC07196A209b1Db77E9B20f5600155BB6643D2Af',
  engine: '0x3C4a3eC3bF3D3292919138208096f1F985aAe038',
  fxUSD: '0xF3A52963edFb2519B0049C31F6856DbaECb4E3dB',
  stabilityPool: '0xb22f69907011D4d9FB96F66820bA9276069D0f85',
})

const chain = {
  id: 9280,
  name: 'Rabbit Testnet',
  nativeCurrency: {
    name: 'Test RAB',
    symbol: 'tRAB',
    decimals: 18,
  },
  rpcUrls: { default: { http: [RPC] } },
}

const publicClient = createPublicClient({
  chain,
  transport: http(RPC, { timeout: 20000 }),
})

const engineAbi = parseAbi([
  'function approvedTester(address) view returns (bool)',
  'function positions(address) view returns (uint256 collateral,uint256 debt)',
  'function totalDebt() view returns (uint256)',
  'function collateralValueUSD(uint256) view returns (uint256)',
  'function deposit() payable',
  'function mint(uint256)',
  'function repay(uint256)',
  'function withdrawCollateral(uint256)',
])

const tokenAbi = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
])

const oracleAbi = parseAbi([
  'function rates(bytes32) view returns (uint192 value,uint64 observedAt,uint64 publishedAt)',
  'function halted(bytes32) view returns (bool)',
])


// RabbitSwap on-chain spot/reference bridge.
// NOT an oracle suitable for collateralized minting by itself.
export async function readRabbitFXSwapBridge() {
  const { RABBIT_SWAP_TESTNET: swap } =
    await import('../config/swap.js')

  const { default: market } =
    await import('../config/rabbitFXMarketSnapshot.json')

  const routerAbi = parseAbi([
    'function factory() view returns (address)',
    'function tWRAB() view returns (address)',
    'function getReserves(address,address) view returns (uint256,uint256)',
    'function getAmountsOut(uint256,address[]) view returns (uint256[])',
    'function pairFor(address,address) view returns (address)',
  ])

  const tokenIn = swap.wrappedNative
  const tokenOut = swap.tokens.tRUSD.address

  const chainId = await publicClient.getChainId()
  if (chainId !== 9280) throw new Error('Wrong chain')

  const [factory, wrapped, pair, reserves, quote] =
    await Promise.all([
      publicClient.readContract({
        address: swap.router,
        abi: routerAbi,
        functionName: 'factory',
      }),
      publicClient.readContract({
        address: swap.router,
        abi: routerAbi,
        functionName: 'tWRAB',
      }),
      publicClient.readContract({
        address: swap.router,
        abi: routerAbi,
        functionName: 'pairFor',
        args: [tokenIn, tokenOut],
      }),
      publicClient.readContract({
        address: swap.router,
        abi: routerAbi,
        functionName: 'getReserves',
        args: [tokenIn, tokenOut],
      }),
      publicClient.readContract({
        address: swap.router,
        abi: routerAbi,
        functionName: 'getAmountsOut',
        args: [10n ** 18n, [tokenIn, tokenOut]],
      }),
    ])

  if (
    factory.toLowerCase() !== swap.factory.toLowerCase() ||
    wrapped.toLowerCase() !== tokenIn.toLowerCase()
  ) {
    throw new Error('RabbitSwap configuration mismatch')
  }

  if (
    /^0x0{40}$/i.test(pair) ||
    reserves[0] === 0n ||
    reserves[1] === 0n
  ) {
    throw new Error('tRAB/tRUSD pool has no liquidity')
  }

  // ReserveA = tWRAB 18 decimals
  // ReserveB = tRUSD 6 decimals
  // Quote spot in 6-decimal simulated USD units per 1 tRAB.
  const spotUSD6 = reserves[1] * 10n ** 18n / reserves[0]

  const spotUSD = Number(formatUnits(spotUSD6, 6))
  const executableUSD = Number(formatUnits(quote[1], 6))

  if (
    !Number.isFinite(spotUSD) ||
    !Number.isFinite(executableUSD) ||
    spotUSD <= 0 ||
    executableUSD <= 0
  ) {
    throw new Error('Invalid RabbitSwap price')
  }

  const referenceAgeDays = Math.floor(
    (Date.now() -
      Date.parse(`${market.sourceDate}T00:00:00Z`)) / 86400000
  )

  const fxReferenceValid =
    referenceAgeDays >= 0 &&
    referenceAgeDays <= 5

  function fxPerRAB(code) {
    if (!fxReferenceValid) return null
    const row = market.currencies.find(item => item.code === code)
    if (!row?.referenceAvailable || !row.usdPerUnit) return null
    const usdPerUnit = Number(row.usdPerUnit)
    if (!Number.isFinite(usdPerUnit) || usdPerUnit <= 0) return null
    return spotUSD / usdPerUnit
  }

  return {
    pair,
    router: swap.router,
    source: 'RabbitSwap tRAB/tRUSD',
    spotUSDPerRAB: spotUSD,
    executableUSDForOneRAB: executableUSD,
    reserveTRAB: formatUnits(reserves[0], 18),
    reserveTRUSD: formatUnits(reserves[1], 6),
    referenceDate: market.sourceDate,
    fxReferenceValid,
    impliedBRLPerRAB: fxPerRAB('BRL'),
    impliedEURPerRAB: fxPerRAB('EUR'),
    safeForMint: false,
    warning:
      'Spot price can be manipulated. Requires TWAP, ' +
      'minimum liquidity and oracle validation before mint.',
  }
}

export async function readRabbitFXPosition(account) {
  const network = await publicClient.getChainId()

  if (network !== 9280) {
    throw new Error('RPC nao esta na Rabbit Testnet 9280')
  }

  const [position, approved, balance, supply, nativeBalance, halted, rate] =
    await Promise.all([
      publicClient.readContract({
        address: RABBIT_FX.engine,
        abi: engineAbi,
        functionName: 'positions',
        args: [account],
      }),
      publicClient.readContract({
        address: RABBIT_FX.engine,
        abi: engineAbi,
        functionName: 'approvedTester',
        args: [account],
      }),
      publicClient.readContract({
        address: RABBIT_FX.fxUSD,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [account],
      }),
      publicClient.readContract({
        address: RABBIT_FX.fxUSD,
        abi: tokenAbi,
        functionName: 'totalSupply',
      }),
      publicClient.getBalance({ address: account }),
      publicClient.readContract({
        address: RABBIT_FX.oracle,
        abi: oracleAbi,
        functionName: 'halted',
        args: [stringToHex('RAB', { size: 32 })],
      }),
      publicClient.readContract({
        address: RABBIT_FX.oracle,
        abi: oracleAbi,
        functionName: 'rates',
        args: [stringToHex('RAB', { size: 32 })],
      }),
    ])

  const [price, observedAt, publishedAt] = rate
  const now = Math.floor(Date.now() / 1000)
  const priceAge = observedAt > 0n
    ? now - Number(observedAt)
    : null

  const priceValid =
    !halted &&
    price > 0n &&
    priceAge !== null &&
    priceAge >= 0 &&
    priceAge <= 1800

  return {
    account,
    chainId: network,
    mode: 'LEGACY_BETA_READ_ONLY',
    approvedTester: approved,
    collateralTRAB: formatEther(position[0]),
    debtFXUSD: formatUnits(position[1], 6),
    walletTRAB: formatEther(nativeBalance),
    walletFXUSD: formatUnits(balance, 6),
    totalSupplyFXUSD: formatUnits(supply, 6),
    oracle: {
      halted,
      priceUSDPerRAB: formatUnits(price, 8),
      observedAt: Number(observedAt),
      publishedAt: Number(publishedAt),
      ageSeconds: priceAge,
      validForNewMint: priceValid,
    },
    actionsEnabled: false,
    reason:
      'Legacy beta requires approved testers; public permissionless protocol not deployed.',
  }
}

// These methods deliberately require an explicit integration-time gate.
// Do not activate them for public users against the restricted beta.
async function submitLegacyAction(account, functionName, args = [], value = 0n) {
  throw new Error(
    'Operacao bloqueada: o Vault permissionless definitivo ainda nao foi implantado. '
    + 'Nao usar o Engine beta restrito como protocolo publico.'
  )
}

export async function depositTRAB(account, amount) {
  return submitLegacyAction(
    account,
    'deposit',
    [],
    parseEther(amount)
  )
}

export async function mintFXUSD(account, amount) {
  return submitLegacyAction(
    account,
    'mint',
    [parseUnits(amount, 6)]
  )
}

export async function repayFXUSD(account, amount) {
  return submitLegacyAction(
    account,
    'repay',
    [parseUnits(amount, 6)]
  )
}

export async function withdrawTRAB(account, amount) {
  return submitLegacyAction(
    account,
    'withdrawCollateral',
    [parseEther(amount)]
  )
}
